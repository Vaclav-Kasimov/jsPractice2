(function (global) {

	var ajaxUtils = {};//fake namespace for ajax utility
	
	function getRequestObject() {
		//Возвращает (свежесозданный) объект запроса HTTP
		if (global.XMLHttpRequest) {
			return (new XMLHttpRequest());
		}
		else{
			global.alert("Ajax is not supported!");
			return(null);
		}
	}

	//Отправляет HTTP-запрос GET на requestURL
	ajaxUtils.sendGetRequest =
		function(requestUrl, responseHandler, isJsonResponse){ //responseHandler Это обработчик ОТВЕТА на запрос, та функция, в которую и придет ответ на наш запрос и которая уже будет с ним что-то делать
			var request = getRequestObject();//Создаем новый объект XMLHttpRequest
			//При изменении статуса этого обьекта (событие) https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
			request.onreadystatechange = 
			function(){
				handleResponse(request, responseHandler, isJsonResponse);
			};
			request.open('GET', requestUrl, true);//Отправляем GET-запрос. Последний аргумент обязательно true, иначе это будет не ассинхронный, а синхронный запрос!!!
			request.send(null);//Отправляет запрос на сервер. Null потому что в гет-запросе requestUrl это параметр, а в Post запросе это было бы частью тела запроса. А тут тела запроса у нас нет
		};

		//Вызывает предоставленный пользователем обработчик
		//Запроса, если ответ на запрос готов и не является сообще-
		//нием об ошибке. Иначе ничего не делает.
		function handleResponse(request, responseHandler, isJsonResponse) {
			if ((request.readyState == 4) && (request.status == 200)) {
				if (isJsonResponse) {
			      responseHandler(JSON.parse(request.responseText));
			    }
			    else {
			      responseHandler(request.responseText);
			    }
			}
		}

		global.$ajaxUtils = ajaxUtils;

})(window)