"use client";

import React from "react";
import LegalDocLayout from "@/components/ui/LegalDocLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function PersonalDataConsentPage() {
  const { t, language } = useTranslation();

  const isRu = language === "ru";

  const ruContent = (
    <>
      <section>
        <p className="mb-4 font-semibold text-slate-800">
          Присоединяясь к настоящему Согласию и оставляя свои данные на веб-сайте reAnswer (далее — «Сайт»), Вы подтверждаете, что действуете свободно, своей волей и в своем интересе, а также выражаете свое безусловное согласие на обработку Ваших персональных данных.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Кому предоставляется согласие</h2>
        <p className="mb-4">
          Согласие на обработку персональных данных предоставляется Оператору:
          <br />
          <strong>Индивидуальный предприниматель Лебедева Екатерина Владимировна</strong>
          <br />
          ИНН: 371119373205
          <br />
          ОГРН/ОГРНИП: 326370000028346
          <br />
          Контактный e-mail: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Перечень персональных данных, на обработку которых дается согласие</h2>
        <p className="mb-2">Вы соглашаетесь на обработку следующих Ваших данных:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Фамилия, Имя, Отчество (при наличии).</li>
          <li>Адрес электронной почты (e-mail).</li>
          <li>Номер контактного телефона.</li>
          <li>Идентификатор (ID) аккаунта в мессенджере Telegram (при подключении оповещений).</li>
          <li>Предоставленные стандартные API-токены Wildberries (для интеграции с функционалом маркетплейса).</li>
          <li>Технические данные, автоматически передаваемые устройством (IP-адрес, файлы cookie, тип браузера, операционная система).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Перечень действий с персональными данными</h2>
        <p className="mb-4">
          Настоящее Согласие дается на совершение любых действий в отношении персональных данных, которые необходимы для достижения указанных ниже целей, включая без ограничений: сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.
        </p>
        <p className="mb-4">
          Обработка данных может осуществляться как с использованием средств автоматизации (автоматизированная обработка), так и без использования таких средств (ручная обработка).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Цели обработки данных</h2>
        <p className="mb-2">Персональные данные Пользователя обрабатываются в следующих целях:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Регистрация и идентификация Пользователя на Сайте, предоставление доступа к Личному кабинету.</li>
          <li>Исполнение соглашений и договоров, включая обеспечение работы сервиса автоответов на отзывы.</li>
          <li>Связь с Пользователем, направление уведомлений, запросов, касающихся использования Сайта, и обработка обращений.</li>
          <li>Проведение аналитических и статистических исследований для улучшения качества работы сервиса.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Срок действия согласия и порядок его отзыва</h2>
        <p className="mb-4">
          Настоящее Согласие действует с момента Вашей регистрации на Сайте или предоставления данных иными способами до момента прекращения работы Сайта или до момента отзыва согласия.
        </p>
        <p className="mb-4">
          Вы можете отозвать данное Согласие в любой момент. Для этого необходимо отправить письменное уведомление в свободной форме на адрес электронной почты Оператора: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a> с темой письма «Отзыв согласия на обработку персональных данных».
        </p>
        <p className="mb-4">
          После получения уведомления об отзыве согласия Оператор прекратит обработку персональных данных и уничтожит их в срок, не превышающий 30 дней, за исключением случаев, когда сохранение данных требуется применимым законодательством. Мы также уведомляем Вас, что отзыв Согласия влечет за собой полное удаление Вашей учетной записи и невозможность дальнейшего использования Сайта.
        </p>
      </section>
    </>
  );

  const enContent = (
    <>
      <section>
        <p className="mb-4 font-semibold text-slate-800">
          By accepting this Consent and providing your details on the reAnswer website (hereinafter referred to as the "Site"), you confirm that you act freely, of your own free will and in your own interest, and express your unconditional consent to the processing of your personal data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. To Whom the Consent is Granted</h2>
        <p className="mb-4">
          Consent to personal data processing is granted to the Operator:
          <br />
          <strong>Individual Entrepreneur Lebedeva Ekaterina Vladimirovna</strong>
          <br />
          INN: 371119373205
          <br />
          OGRN/OGRNIP: 326370000028346
          <br />
          Contact Email: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. List of Processed Personal Data</h2>
        <p className="mb-2">You agree to the processing of the following personal details:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Full name.</li>
          <li>Email address (e-mail).</li>
          <li>Contact phone number.</li>
          <li>Telegram messenger account ID (if notifications are linked).</li>
          <li>Provided standard Wildberries API tokens (for marketplace integration features).</li>
          <li>Technical data automatically transmitted by your device (IP address, cookies, browser type, OS).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. List of Operations on Personal Data</h2>
        <p className="mb-4">
          This Consent is granted to perform any actions in relation to personal data necessary to achieve the goals listed below, including without limitation: collection, recording, systematization, accumulation, storage, clarification (updating, changing), extraction, use, transfer (provision, access), depersonalization, blocking, deletion, and destruction of personal data.
        </p>
        <p className="mb-4">
          Data processing may be carried out either with the use of automation tools (automated processing) or without the use of such tools (manual processing).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Purposes of Data Processing</h2>
        <p className="mb-2">User\'s personal data is processed for the following purposes:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Registration and identification of the User on the Site, providing access to the Personal Account.</li>
          <li>Execution of agreements and contracts, including supporting the review auto-response automation.</li>
          <li>Communicating with the User, sending notifications, requests regarding Site usage, and processing support cases.</li>
          <li>Conducting analytical and statistical research to improve service quality.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Validity of Consent and Revocation Procedure</h2>
        <p className="mb-4">
          This Consent is valid from the moment of registration on the Site or the provision of data in other ways until the termination of the Site operations or until the consent is revoked.
        </p>
        <p className="mb-4">
          You can revoke this Consent at any time. To do this, send a written notice in free form to the Operator\'s email address: <a href="mailto:lebedevaekw@yandex.ru" className="text-indigo-600 hover:underline">lebedevaekw@yandex.ru</a> with the subject line "Revocation of consent to personal data processing".
        </p>
        <p className="mb-4">
          Upon receipt of the revocation notice, the Operator will stop processing personal data and destroy it within a period not exceeding 30 days, except for cases required by applicable law. We also notify you that the revocation of Consent results in the complete deletion of your account and the inability to further use the Site.
        </p>
      </section>
    </>
  );

  return (
    <LegalDocLayout
      title={
        isRu
          ? "Согласие на обработку персональных данных"
          : "Consent to Personal Data Processing"
      }
      subtitle={
        isRu
          ? "Согласие на обработку, использование и хранение персональной информации"
          : "Consent to the processing, use, and storage of personal information"
      }
      lastUpdated={isRu ? "Последнее обновление: 28 мая 2026 г." : "Last updated: May 28, 2026"}
    >
      {isRu ? ruContent : enContent}
    </LegalDocLayout>
  );
}
