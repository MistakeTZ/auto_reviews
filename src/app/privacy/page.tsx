"use client";

import LegalDocLayout from "@/components/ui/LegalDocLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPolicyPage() {
  const { t, language } = useTranslation();

  const isRu = language === "ru";

  const ruContent = (
    <>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Общие положения</h2>
        <p className="mb-4">
          Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональной информации пользователей (далее — «Пользователь» или «Вы»), которую Индивидуальный предприниматель Лебедева Екатерина Владимировна (далее — «Оператор» или «Мы») может получить во время использования Пользователем веб-сайта reAnswer и связанных с ним сервисов (далее — «Сайт»).
        </p>
        <p className="mb-4">
          Обеспечение конфиденциальности и безопасности Ваших персональных данных является нашим приоритетом. Мы обрабатываем данные в строгом соответствии с Федеральным законом РФ № 152-ФЗ «О персональных данных» и иными применимыми законодательными актами.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Реквизиты оператора</h2>
        <p className="mb-4">
          Обработку персональных данных Пользователей осуществляет:
          <br />
          <strong>Индивидуальный предприниматель Лебедева Екатерина Владимировна</strong>
          <br />
          ИНН: 371119373205
          <br />
          ОГРН/ОГРНИП: 326370000028346
          <br />
          Контактный e-mail: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>
          <br />
          Контактный телефон: <a href="tel:+79106974491" className="text-indigo-600 hover:underline">+7 910 697-44-91</a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Категории обрабатываемых данных</h2>
        <p className="mb-2">Мы можем собирать и обрабатывать следующие типы данных:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Регистрационная информация:</strong> Имя (ФИО), адрес электронной почты, пароль (хранится в зашифрованном виде).</li>
          <li><strong>Контактные данные:</strong> Номер телефона, ID аккаунта Telegram (при подключении уведомлений).</li>
          <li><strong>Интеграционные данные:</strong> API-токены Wildberries (используются исключительно для получения отзывов и автоматической отправки ответов от Вашего имени; хранятся в зашифрованном виде).</li>
          <li><strong>Технические данные:</strong> IP-адрес, тип устройства, версия операционной системы, тип браузера, файлы cookie, данные об использовании функций Сайта.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Цели обработки персональных данных</h2>
        <p className="mb-2">Мы обрабатываем Ваши персональные данные исключительно для достижения следующих целей:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Предоставление доступа к функционалу Сайта, включая автоматизацию работы с отзывами на маркетплейсе Wildberries.</li>
          <li>Обеспечение безопасности Сайта, предотвращение мошенничества и несанкционированного доступа.</li>
          <li>Связь с Пользователем, включая направление ответов на запросы, техническую поддержку, выставление счетов и отправку уведомлений.</li>
          <li>Анализ и улучшение качества работы Сайта, разработка новых функций и оптимизация интерфейса.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Безопасность и шифрование данных</h2>
        <p className="mb-4">
          Мы принимаем все необходимые организационные, административные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.
        </p>
        <p className="mb-4">
          В частности, стандартные API-токены Wildberries, которые Вы предоставляете для интеграции с личным кабинетом продавца, шифруются с использованием современных криптографических алгоритмов перед сохранением в базу данных. Доступ к ключам дешифрования строго ограничен.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">6. Передача третьим лицам</h2>
        <p className="mb-4">
          Мы не продаем, не обмениваем и не передаем Ваши персональные данные третьим лицам. Исключение составляют случаи предоставления информации государственным органам в соответствии с требованиями законодательства Российской Федерации.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">7. Ваши права и отзыв согласия</h2>
        <p className="mb-4">
          Вы имеете право на доступ к своим персональным данным, их уточнение, блокирование или уничтожение в случае, если данные являются неполными, устаревшими или неточными.
        </p>
        <p className="mb-4">
          Вы можете в любой момент отозвать свое согласие на обработку персональных данных, направив соответствующее заявление по адресу электронной почты: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>. После получения Вашего обращения мы прекратим обработку данных и удалим Ваш аккаунт в установленные законом сроки, за исключением сведений, хранение которых обязательно в соответствии с законом.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">8. Изменения в Политике конфиденциальности</h2>
        <p className="mb-4">
          Мы оставляем за собой право вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента ее публикации на Сайте. Мы рекомендуем Пользователям регулярно проверять эту страницу на предмет изменений.
        </p>
      </section>
    </>
  );

  const enContent = (
    <>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. General Provisions</h2>
        <p className="mb-4">
          This Privacy Policy (hereinafter referred to as the "Policy") governs the processing and protection of personal information of users (hereinafter referred to as the "User" or "You") that Individual Entrepreneur Lebedeva Ekaterina Vladimirovna (hereinafter referred to as the "Operator" or "We") may obtain while the User is using the reAnswer website and related services (hereinafter referred to as the "Site").
        </p>
        <p className="mb-4">
          Ensuring the confidentiality and security of your personal data is our primary commitment. We process data in strict compliance with the Federal Law of the Russian Federation No. 152-FZ "On Personal Data" and other applicable legal acts.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Operator Details</h2>
        <p className="mb-4">
          The processing of Users\' personal data is carried out by:
          <br />
          <strong>Individual Entrepreneur Lebedeva Ekaterina Vladimirovna</strong>
          <br />
          INN: 371119373205
          <br />
          OGRN/OGRNIP: 326370000028346
          <br />
          Contact Email: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>
          <br />
          Contact Phone: <a href="tel:+79106974491" className="text-indigo-600 hover:underline">+7 910 697-44-91</a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Categories of Processed Data</h2>
        <p className="mb-2">We may collect and process the following types of data:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Registration Info:</strong> Name, email address, password (stored encrypted).</li>
          <li><strong>Contact Details:</strong> Telephone number, Telegram Account ID (if notifications are connected).</li>
          <li><strong>Integration Data:</strong> Wildberries API tokens (used exclusively to fetch reviews and automatically submit replies on your behalf; stored encrypted).</li>
          <li><strong>Technical Data:</strong> IP address, device type, OS version, browser type, cookies, Site features usage logs.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Purposes of Data Processing</h2>
        <p className="mb-2">We process your personal data solely to achieve the following goals:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Providing access to the Site\'s features, including automating responses to Wildberries reviews.</li>
          <li>Ensuring Site safety, preventing fraud and unauthorized access.</li>
          <li>Communicating with the User, including support requests, billing, and system notifications.</li>
          <li>Analyzing and improving Site quality, developing new features and optimization.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Data Security and Encryption</h2>
        <p className="mb-4">
          We take all necessary organizational, administrative, and technical measures to protect personal data from unauthorized access, modification, disclosure, or destruction.
        </p>
        <p className="mb-4">
          Particularly, standard Wildberries API tokens that you provide for integration with your seller account are encrypted using robust cryptographic algorithms before being saved to the database. Access to decryption keys is strictly restricted.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">6. Third-Party Disclosures</h2>
        <p className="mb-4">
          We do not sell, trade, or transfer your personal data to third parties. This does not include providing information to government authorities in accordance with the requirements of the legislation of the Russian Federation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">7. Your Rights and Revoking Consent</h2>
        <p className="mb-4">
          You have the right to access your personal data, clarify it, block it, or destroy it if the data is incomplete, outdated, or inaccurate.
        </p>
        <p className="mb-4">
          You can revoke your consent to the processing of personal data at any time by sending a request to our email: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>. Upon receipt of your request, we will cease processing and delete your account within legally established terms, except for information mandatory for storage by law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">8. Changes to the Privacy Policy</h2>
        <p className="mb-4">
          We reserve the right to modify this Policy. The new version takes effect upon its publication on the Site. We encourage Users to regularly check this page for changes.
        </p>
      </section>
    </>
  );

  return (
    <LegalDocLayout
      title={isRu ? "Политика конфиденциальности" : "Privacy Policy"}
      subtitle={
        isRu
          ? "Правила обработки и защиты персональной информации в сервисе reAnswer"
          : "Rules of processing and protecting personal information in the reAnswer service"
      }
      lastUpdated={isRu ? "Последнее обновление: 28 мая 2026 г." : "Last updated: May 28, 2026"}
    >
      {isRu ? ruContent : enContent}
    </LegalDocLayout>
  );
}
