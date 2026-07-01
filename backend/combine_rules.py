import sys
import os

# Set search path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.database import SessionLocal
import database.models as models

def combine_rules():
    db = SessionLocal()
    try:
        # 1. Fetch all rules
        rules = db.query(models.SpamRule).all()
        
        # 2. Trigger auto-migration for any unmigrated legacy rules
        migrated = False
        for rule in rules:
            if not rule.chats and rule.chat_id:
                legacy_chat = models.SpamRuleChat(
                    rule_id=rule.id,
                    chat_id=rule.chat_id,
                    client_name=rule.client_name,
                    reply_sign=rule.reply_sign,
                    is_active=rule.is_active,
                    last_sent_at=rule.last_sent_at,
                    last_sent_message_timestamp=rule.last_sent_message_timestamp,
                )
                db.add(legacy_chat)
                migrated = True
        if migrated:
            db.commit()
            print("Auto-migrated legacy rules to new multi-chat layout.")
            # Refetch rules to include new relationship state
            rules = db.query(models.SpamRule).all()
            
        # 3. Group rules
        # Grouping criteria: same user, templates, frequency_type, interval_days, and send_hours
        groups = {}
        for rule in rules:
            # Sorted template IDs to compare exact matching template configurations
            template_ids = sorted([t.id for t in rule.templates])
            tpl_sig = tuple(template_ids)
            
            key = (
                rule.user_id,
                rule.frequency_type,
                rule.interval_days,
                rule.send_hours,
                tpl_sig
            )
            groups.setdefault(key, []).append(rule)
            
        # 4. Perform merging of duplicate groups
        total_rules_deleted = 0
        total_chats_moved = 0
        
        for key, rule_group in groups.items():
            if len(rule_group) <= 1:
                continue
                
            # Retain oldest rule (lowest ID) as the primary target
            rule_group.sort(key=lambda r: r.id)
            primary_rule = rule_group[0]
            duplicate_rules = rule_group[1:]
            
            user_id, freq_type, interval_days, send_hours, tpl_sig = key
            print(f"\nMerging {len(rule_group)} duplicate rules for User ID {user_id}:")
            print(f"  Primary Rule ID: {primary_rule.id}")
            print(f"  Duplicates to delete: {[r.id for r in duplicate_rules]}")
            print(f"  Configuration: Frequency={freq_type}, Days={interval_days}, Hours={send_hours}")
            
            primary_chat_ids = {c.chat_id: c for c in primary_rule.chats}
            
            for dup_rule in duplicate_rules:
                # Re-associate or merge chats
                for chat in list(dup_rule.chats):
                    if chat.chat_id in primary_chat_ids:
                        primary_chat = primary_chat_ids[chat.chat_id]
                        # Keep active if either was active
                        primary_chat.is_active = primary_chat.is_active or chat.is_active
                        # Retain most recent sent timestamp state
                        if chat.last_sent_at:
                            if not primary_chat.last_sent_at or chat.last_sent_at > primary_chat.last_sent_at:
                                primary_chat.last_sent_at = chat.last_sent_at
                                primary_chat.last_sent_message_timestamp = max(
                                    primary_chat.last_sent_message_timestamp or 0,
                                    chat.last_sent_message_timestamp or 0
                                )
                        db.delete(chat)
                    else:
                        # Move chat relation to the primary rule
                        chat.rule = primary_rule
                        primary_chat_ids[chat.chat_id] = chat
                        total_chats_moved += 1
                        
                # Update sent message history logs pointing to this rule
                db.query(models.SpamSentMessage).filter(
                    models.SpamSentMessage.rule_id == dup_rule.id
                ).update({models.SpamSentMessage.rule_id: primary_rule.id}, synchronize_session=False)
                
                # Delete duplicate rule row
                db.delete(dup_rule)
                total_rules_deleted += 1
                
        if total_rules_deleted > 0:
            db.commit()
            print(f"\nCleanup complete:")
            print(f"  - Combined and deleted {total_rules_deleted} duplicate rules.")
            print(f"  - Re-associated {total_chats_moved} chats to active primary rules.")
        else:
            print("\nNo duplicate rules found to combine.")
            
    except Exception as e:
        db.rollback()
        print(f"Error combining rules: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    combine_rules()
