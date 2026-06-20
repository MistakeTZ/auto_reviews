"use client";

import LegalDocLayout from "@/components/ui/LegalDocLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function AmoPolicyPage() {
  const { t, language } = useTranslation();

  const isRu = language === "ru";

  const ruContent = (
    <>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          1. Общие положения
        </h2>
        <p className="mb-4">
          Настоящая Политика конфиденциальности (далее — «Политика») определяет
          порядок обработки, транзита и защиты информации, которую
          интеграционный виджет WB чат для amoCRM (далее — «Виджет») получает в
          процессе его использования Пользователем (далее — «Пользователь» или
          «Вы»).
        </p>
        <p className="mb-4">
          Разработчиком и Оператором Виджета является Индивидуальный
          предприниматель Лебедева Екатерина Владимировна (далее — «Оператор»
          или «Мы»). Мы обрабатываем технические и интеграционные данные в
          строгом соответствии с Федеральным законом РФ № 152-ФЗ «О персональных
          данных».
        </p>
        <p className="mb-4">
          <strong>Важное примечание:</strong> Виджет не является самостоятельным
          веб-сайтом, не осуществляет регистрацию Пользователей по личным
          учетным данным, не использует файлы cookie и не собирает персональные
          контактные данные Пользователя.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          2. Реквизиты оператора
        </h2>
        <p className="mb-4">
          Разработку и техническую поддержку Виджета осуществляет:
          <br />
          <strong>
            Индивидуальный предприниматель Лебедева Екатерина Владимировна
          </strong>
          <br />
          ИНН: 371119373205
          <br />
          ОГРН/ОГРНИП: 326370000028346
          <br />
          Контактный e-mail:{" "}
          <a
            href="mailto:lebedevaekw@yandex.ru"
            className="text-indigo-600 hover:underline"
          >
            lebedevaekw@yandex.ru
          </a>
          <br />
          Контактный телефон:{" "}
          <a
            href="tel:+79106974491"
            className="text-indigo-600 hover:underline"
          >
            +7 910 697-44-91
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          3. Категории обрабатываемых и хранящихся данных
        </h2>
        <p className="mb-2">
          Для обеспечения обмена сообщениями и работы интеграции Виджет
          обрабатывает и сохраняет исключительно следующие категории данных:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Технические данные аккаунта amoCRM:</strong> Идентификатор
            аккаунта (amo_account_id), субдомен вашей CRM-системы, а также
            разрешения аккаунта для легитимного взаимодействия с вашим аккаунтом
            через API.
          </li>
          <li>
            <strong>Интеграционные ключи маркетплейса:</strong> API-токен
            Wildberries, предоставленный Вами в настройках Виджета (используется
            строго для авторизации запросов к API маркетплейса с целью получения
            диалогов и отправки ответов).
          </li>
          <li>
            <strong>Служебные и маршрутные идентификаторы:</strong> Технические
            ID чатов Wildberries, ID сообщений, ID менеджеров amoCRM (для
            назначения ответственных в CRM) и уникальные идентификаторы заявок
            на возврат (rid/claim_id).
          </li>
          <li>
            <strong>Данные потока сообщений и вложений:</strong> Текстовое
            содержимое сообщений покупателей, имена клиентов на маркетплейсе
            (clientName) и медиафайлы/изображения. Данные файлы скачиваются
            Виджетом во время синхронизации и хранятся временно (транзитно) до
            момента их успешной отправки в интерфейс amoCRM Chats API, после
            чего удаляются из очереди обработки.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          4. Цели обработки данных
        </h2>
        <p className="mb-2">
          Все собираемые технические данные обрабатываются исключительно в
          автоматическом режиме со следующими целями:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            Обеспечение базовой работоспособности интеграции: трансляция
            входящих сообщений от покупателей Wildberries в личный кабинет
            amoCRM в виде чатов.
          </li>
          <li>
            Предоставление возможности отправки исходящих ответов от лица
            продавца обратно на маркетплейс Wildberries напрямую из карточки
            сделки amoCRM.
          </li>
          <li>
            Автоматическое создание и обновление карточек сделок (лидов) в
            amoCRM, включая автоматическое заполнение системных полей («Ссылка
            на чат WB», «Название товара WB»).
          </li>
          <li>
            Синхронизация рекламаций и импорт заявок на возврат от покупателей
            Wildberries в CRM-систему Пользователя (при активации
            соответствующей опции).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          5. Безопасность и шифрование данных
        </h2>
        <p className="mb-4">
          Безопасность ваших интеграционных ключей является критически важной.
          API-токены Wildberries, а также OAuth-токены доступа к amoCRM
          шифруются с использованием современных криптографических алгоритмов
          перед записью в базу данных. Доступ к ключам дешифрования на сервере
          строго изолирован и ограничен.
        </p>
        <p className="mb-4">
          Передача любых данных между серверами Wildberries, amoCRM и серверной
          частью Виджета осуществляется исключительно по защищенным каналам
          связи с использованием протокола шифрования SSL/TLS.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          6. Передача третьим лицам
        </h2>
        <p className="mb-4">
          Мы не осуществляем передачу интеграционных токенов, ключей доступа или
          содержимого переписок третьим лицам. Информационный обмен происходит
          строго между двумя сопряженными информационными системами —
          программным интерфейсом Wildberries и вашей платформой amoCRM.
          Исключение составляют лишь официальные запросы государственных органов
          в случаях, прямо предусмотренных законодательством РФ.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          7. Удаление данных и отзыв согласия
        </h2>
        <p className="mb-4">
          Вы сохраняете полный контроль над своими данными. Вы можете в любой
          момент полностью прекратить обработку информации и удалить свои токены
          из базы данных Виджета одним из следующих способов:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            Удалив API-токен Wildberries непосредственно из интерфейса
            расширенных настроек Виджета внутри amoCRM.
          </li>
          <li>
            Удалив (деинсталлировав) сам Виджет WB чат из вашего аккаунта
            amoCRM.
          </li>
          <li>
            Направив официальный запрос на полный отзыв согласия и очистку базы
            данных по электронной почте:{" "}
            <a
              href="mailto:lebedevaekw@yandex.ru"
              className="text-indigo-600 hover:underline"
            >
              lebedevaekw@yandex.ru
            </a>
            . Хранящиеся технические настройки вашего аккаунта будут удалены в
            течение установленных законом сроков.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          8. Изменения в Политике конфиденциальности
        </h2>
        <p className="mb-4">
          Мы оставляем за собой право обновлять настоящую Политику в случае
          изменения архитектуры API маркетплейсов или CRM-систем. Новая редакция
          вступает в силу с момента ее публикации. Рекомендуем периодически
          проверять данную страницу.
        </p>
      </section>
    </>
  );

  const enContent = (
    <>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          1. General Provisions
        </h2>
        <p className="mb-4">
          This Privacy Policy (hereinafter referred to as the "Policy") governs
          the processing, transit, and protection of information that the WB
          Chat integration widget for amoCRM (hereinafter referred to as the
          "Widget") receives during its use by the User (hereinafter referred to
          as the "User" or "You").
        </p>
        <p className="mb-4">
          The developer and Operator of the Widget is Individual Entrepreneur
          Lebedeva Ekaterina Vladimirovna (hereinafter referred to as the
          "Operator" or "We"). We process technical and integration data in
          strict compliance with the Federal Law of the Russian Federation No.
          152-FZ "On Personal Data".
        </p>
        <p className="mb-4">
          <strong>Important Note:</strong> The Widget is not a standalone
          website, does not register Users using personal credentials, does not
          use cookies, and does not collect personal contact information of the
          User.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          2. Operator Details
        </h2>
        <p className="mb-4">
          Development and technical support of the Widget is carried out by:
          <br />
          <strong>
            Individual Entrepreneur Lebedeva Ekaterina Vladimirovna
          </strong>
          <br />
          INN: 371119373205
          <br />
          OGRN/OGRNIP: 326370000028346
          <br />
          Contact Email:{" "}
          <a
            href="mailto:lebedevaekw@yandex.ru"
            className="text-indigo-600 hover:underline"
          >
            lebedevaekw@yandex.ru
          </a>
          <br />
          Contact Phone:{" "}
          <a
            href="tel:+79106974491"
            className="text-indigo-600 hover:underline"
          >
            +7 910 697-44-91
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          3. Categories of Processed and Stored Data
        </h2>
        <p className="mb-2">
          To ensure message exchange and integration functionality, the Widget
          processes and stores exclusively the following categories of data:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Technical amoCRM Account Data:</strong> Account ID
            (amo_account_id), your CRM system subdomain, and account scope for
            secure interaction with your account via API.
          </li>
          <li>
            <strong>Marketplace Integration Keys:</strong> Wildberries API token
            provided by you in the Widget settings (used strictly to authorize
            requests to the marketplace API to fetch dialogs and send replies).
          </li>
          <li>
            <strong>Service and Routing Identifiers:</strong> Technical
            Wildberries chat IDs, message IDs, amoCRM manager IDs (to assign
            responsible agents in CRM), and unique identifiers for return claims
            (rid/claim_id).
          </li>
          <li>
            <strong>Message Flow and Attachment Data:</strong> Text content of
            buyer messages, customer names on the marketplace (clientName), and
            media files/images. These files are downloaded by the Widget during
            synchronization and stored temporarily (in transit) until they are
            successfully uploaded to the amoCRM Chats API interface, after which
            they are deleted from the processing queue.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          4. Purposes of Data Processing
        </h2>
        <p className="mb-2">
          All technical data collected is processed entirely automatically for
          the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            Ensuring core integration functionality: transmitting incoming
            messages from Wildberries buyers into your amoCRM account as chats.
          </li>
          <li>
            Enabling the ability to send outgoing responses from the seller back
            to the Wildberries marketplace directly from the amoCRM lead card.
          </li>
          <li>
            Automatically creating and updating lead cards in amoCRM, including
            automatically filling custom fields ("WB Chat Link", "WB Product
            Name").
          </li>
          <li>
            Synchronizing return claims and importing return requests from
            Wildberries buyers into the User's CRM system (when the option is
            activated).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          5. Data Security and Encryption
        </h2>
        <p className="mb-4">
          The security of your integration keys is critical to us. Wildberries
          API tokens, as well as amoCRM access OAuth tokens, are encrypted using
          modern cryptographic algorithms before being saved to the database.
          Access to decryption keys on the server is strictly isolated and
          restricted.
        </p>
        <p className="mb-4">
          Transmission of any data between Wildberries servers, amoCRM, and the
          Widget backend is carried out exclusively via secure communication
          channels using SSL/TLS encryption protocols.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          6. Third-Party Disclosures
        </h2>
        <p className="mb-4">
          We do not transfer integration tokens, access keys, or chat content to
          third parties. Information exchange occurs strictly between the two
          paired information systems — the Wildberries API and your amoCRM
          platform. The only exception is official requests from government
          authorities in cases explicitly provided by the legislation of the
          Russian Federation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          7. Data Deletion and Revoking Consent
        </h2>
        <p className="mb-4">
          You retain full control over your data. You can completely stop data
          processing and delete your tokens from the Widget database at any time
          in one of the following ways:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            By deleting the Wildberries API token directly from the WB Chat
            Widget's advanced settings interface within amoCRM.
          </li>
          <li>By uninstalling the WB Chat Widget from your amoCRM account.</li>
          <li>
            By sending an official request for full consent revocation and
            database cleanup by email:{" "}
            <a
              href="mailto:lebedevaekw@yandex.ru"
              className="text-indigo-600 hover:underline"
            >
              lebedevaekw@yandex.ru
            </a>
            . Stored technical settings of your account will be removed within
            legally established terms.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">
          8. Changes to the Privacy Policy
        </h2>
        <p className="mb-4">
          We reserve the right to modify this Policy in the event of changes to
          marketplace or CRM APIs. The new version takes effect upon its
          publication. We encourage Users to regularly check this page for
          changes.
        </p>
      </section>
    </>
  );

  return (
    <LegalDocLayout
      title={isRu ? "Политика конфиденциальности" : "Privacy Policy"}
      subtitle={
        isRu
          ? "Правила обработки и защиты технологической информации в виджете WB чат"
          : "Rules of processing and protecting technological information in the WB Chat widget"
      }
      lastUpdated={
        isRu
          ? "Последнее обновление: 20 июня 2026 г."
          : "Last updated: June 20, 2026"
      }
    >
      {isRu ? ruContent : enContent}
    </LegalDocLayout>
  );
}
