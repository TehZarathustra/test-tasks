# Основная проблема
Сначала три раза срабатывал реквест ```getData```, а потом три раза ```callback```, в результате чего ```callback``` получал неактуальные данные (последний результат итерации — три раза ```responses[populations] = result```).

# Чтобы все работало
Необходимо было передавать каждый раз в ```callback``` актуальные данные.
Проблема решилась с заменой ```for``` на ```forEach```, что позволило связать ```getData``` и ```callback``` так, чтобы они шли поочередно.

В итоге: понадобилось заменить одну строку (50-ую), чтобы приложение заработало, другой код не был тронут, диалог с пользователем был реализован внутри существующих циклов.

# Ссылка

http://trafalgar.tmweb.ru/158%20(yandex)/second/app/index.html
