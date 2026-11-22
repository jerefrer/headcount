// Synthetic Zoom attendee-report CSVs for unit tests (no real PII).
// Day 1 (05/12/2026): Alice rejoins (same email) → 1 person, 30 + 55 = 85 min.
// Bob → 100 min. Two unique attendees: France, Germany.
export const DAY1_MAIN_CSV = `﻿Attendee Report
Report generated time,05/20/2026 10:00:00 AM
Topic,Webinar ID,Actual Start Time,Actual Duration (minutes),Total Users,Unique Viewers
Test Webinar,123 456 7890,05/12/2026 09:00:00 AM,120,3,3
Host Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Host One,host@example.com,05/12/2026 09:00:00 AM,05/12/2026 11:00:00 AM,120,No,United States
Panelist Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Panelist One,panel@example.com,05/12/2026 09:00:00 AM,05/12/2026 11:00:00 AM,120,No,Canada
Attendee Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Alice,alice@example.com,05/12/2026 09:00:00 AM,05/12/2026 09:30:00 AM,30,Yes,France
Yes,Alice,alice@example.com,05/12/2026 09:35:00 AM,05/12/2026 10:30:00 AM,55,Yes,France
Yes,Bob,bob@example.com,05/12/2026 09:00:00 AM,05/12/2026 10:40:00 AM,100,Yes,Germany
`;

// Day 2 (05/13/2026): Carol → 70 min, Spain.
export const DAY2_MAIN_CSV = `﻿Attendee Report
Report generated time,05/20/2026 10:05:00 AM
Topic,Webinar ID,Actual Start Time,Actual Duration (minutes),Total Users,Unique Viewers
Test Webinar,123 456 7890,05/13/2026 09:00:00 AM,90,1,1
Host Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Host One,host@example.com,05/13/2026 09:00:00 AM,05/13/2026 10:30:00 AM,90,No,United States
Panelist Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Attendee Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Carol,carol@example.com,05/13/2026 09:00:00 AM,05/13/2026 10:10:00 AM,70,Yes,Spain
`;

export const NOT_A_ZOOM_REPORT_CSV = `name,score
foo,1
bar,2
`;

// Same webinar exported twice: from a Russian-language Zoom account (dates are
// DD.MM.YYYY, Yes/No are Да/Нет, countries are Russian) and from an English one.
// Parsing both must yield identical data. All e-mails are fake.
export const RU_WEBINAR_CSV = `﻿Отчет об участниках
Время создания отчета,22.11.2026 02:03:38 PM
Тема,Идентификатор вебинара,Фактическое время начала,Фактическая продолжительность (минуты),Уникальные зрители,Всего пользователей:,Максимальное количество одновременных просмотров,Активировать регистрацию
Тестовый вебинар,878 2026 0047,"22.11.2026 10:52:20 AM",187,5,7,4,Нет
Подробнее об организаторе
Участники,Имя пользователя (исходное имя),Эл. почта,Время входа,Время выхода,Время в сеансе (минут),является гостем,Название страны/региона
Да,Host One,host@example.com,"22.11.2026 10:52:20 AM","22.11.2026 01:58:57 PM",187,Нет,Франция
Подробности участника группы
Участники,Имя пользователя (исходное имя),Эл. почта,Время входа,Время выхода,Время в сеансе (минут),является гостем,Название страны/региона
Да,Panelist One,,"22.11.2026 11:38:06 AM","22.11.2026 01:30:53 PM",113,Да,Германия
Подробности участников
Участники,Имя пользователя (исходное имя),Эл. почта,Время входа,Время выхода,Время в сеансе (минут),является гостем,Название страны/региона
Да,Wei,wei@example.com,"22.11.2026 11:09:03 AM","22.11.2026 11:11:18 AM",3,Да,Китай
Да,Wei,wei@example.com,"22.11.2026 11:14:45 AM","22.11.2026 12:14:45 PM",60,Да,Китай
Да,Mei,mei@example.com,"22.11.2026 10:52:23 AM","22.11.2026 11:10:21 AM",18,Да,Тайвань
Да,Kai,kai@example.com,"22.11.2026 11:05:21 AM","22.11.2026 12:35:21 PM",90,Нет,САР Гонконг
Да,Sam,sam@example.com,"22.11.2026 12:05:21 PM","22.11.2026 12:07:46 PM",3,Да,Соединенные Штаты Америки
Да,Ivan,ivan@example.com,"22.11.2026 12:32:19 PM","22.11.2026 12:32:59 PM",1,Да,Монголия
`;

export const EN_WEBINAR_CSV = `﻿Attendee Report
Report generated time,11/22/2026 02:03:38 PM
Topic,Webinar ID,Actual Start Time,Actual Duration (minutes),Unique Viewers,Total Users,Max Concurrent Views,Enable Registration
Тестовый вебинар,878 2026 0047,"11/22/2026 10:52:20 AM",187,5,7,4,No
Host Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Host One,host@example.com,"11/22/2026 10:52:20 AM","11/22/2026 01:58:57 PM",187,No,France
Panelist Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Panelist One,,"11/22/2026 11:38:06 AM","11/22/2026 01:30:53 PM",113,Yes,Germany
Attendee Details
Attended,User Name (Original Name),Email,Join Time,Leave Time,Time in Session (minutes),Is Guest,Country/Region Name
Yes,Wei,wei@example.com,"11/22/2026 11:09:03 AM","11/22/2026 11:11:18 AM",3,Yes,China
Yes,Wei,wei@example.com,"11/22/2026 11:14:45 AM","11/22/2026 12:14:45 PM",60,Yes,China
Yes,Mei,mei@example.com,"11/22/2026 10:52:23 AM","11/22/2026 11:10:21 AM",18,Yes,Taiwan
Yes,Kai,kai@example.com,"11/22/2026 11:05:21 AM","11/22/2026 12:35:21 PM",90,No,Hong Kong SAR
Yes,Sam,sam@example.com,"11/22/2026 12:05:21 PM","11/22/2026 12:07:46 PM",3,Yes,United States
Yes,Ivan,ivan@example.com,"11/22/2026 12:32:19 PM","11/22/2026 12:32:59 PM",1,Yes,Mongolia
`;
