$(function (){
	$("#collapse-btn").blur(function(event){
		var screenWidth = window.innerWidth;
		if (screenWidth <768){
			$("#collapsible-nav").collapse('hide');
		}
	});
});

(function (global) {
	var dc = {};
	 var homeHtml = "snippets/home-snippet.html";
	 var allCategoriesUrl ="https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
	 var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	 var categoryHtml = "snippets/category-snippet.html";
	 var menuItemsUrl ="https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
	 var menuItemsTitleHtml = "snippets/menu-items-title.html";
	 var menuItemHtml = "snippets/menu-item.html";

	//Функция для внесения внутреннего HTML  в выбранный элемент
	var insertHtml = function(selector, html_content) {
		document.querySelector(selector).innerHTML = html_content;
	}

	//Показываем иконку загрузки внутри элемента, выбранного селектором
	var showLoading = function(selector){
		insertHtml(selector,
			"<div class = 'text-center'> <img src='https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/circular_progress_indicator_selective.gif'></div>"
		)
	}


	//То есть все встреченные в string propToReplace будут заменены на propValue благодаря регулярному выражению
	function insertProperty(string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	}

	//Как только загрузится страница (до загрузки css)
	document.addEventListener("DOMContentLoaded", function(event){

		//При первом открытии показывает домашнюю страницу
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			homeHtml,
			function(responseText){
				insertHtml("#main-content", responseText  )
			});

});

	//AJAX запрос на выгрузку категорий меню
	dc.loadMenuCategories = function(){
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(allCategoriesUrl,
			buildAndShowCategoriesHTML, true);
	};

	//Запрос на выгрузку содержимого категории
	dc.loadMenuItems = function(categoryShort){
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			menuItemsUrl+categoryShort,
			buildAndShowMenuItemsHTML, true);
	}

	//Создает HTML для категорий, основанный на данных с сервера
	//В объекте categories хранятся все категории
	  function buildAndShowCategoriesHTML(categories) {
    // Загружает сниппет с категорией
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      // categoriesTitleHtml тут хранится заголовок
      function (categoriesTitleHtml) {
        // Делает плитки для категорий
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          // categoryHtml тут хранится сниппет категории
          function (categoryHtml) {
            var categoriesViewHtml = buildCategoriesViewHtml(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            insertHtml("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
  	var finalHtml = categoriesTitleHtml;//Итоговый HTML код будет здесь
  	finalHtml += "<section class = 'row'>"
  	for (var i = 0; i < categories.length; i++){
  		var html = categoryHtml;
  		var name = "" + categories[i].name;
  		var short_name = categories[i].short_name;
  		html = insertProperty(html, "name", name);
  		html = insertProperty(html, "short_name", short_name);
  		finalHtml +=html;
  	}
  	finalHtml += "</section>";
  	return finalHtml;
  }


  	// Создает HTML для страницы категории, основываясь на данных с сервера
	function buildAndShowMenuItemsHTML(categoryMenuItems){
		$ajaxUtils.sendGetRequest(
	      menuItemsTitleHtml,
	      function (menuItemsTitleHtml) {
	        $ajaxUtils.sendGetRequest(
	          menuItemHtml,
	          function (menuItemHtml) {
	            var menuItemsViewHtml = buildMenuItemsViewHtml(
	              categoryMenuItems,
	              menuItemsTitleHtml,
	              menuItemHtml
	            );
	            insertHtml("#main-content", menuItemsViewHtml);
	          },
	          false
	        );
	      },
	      false
	    );
	}  

	  // вставляем данные в сниппеты и строим
  // HTML для итоговой страницы
  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Обход элементов меню
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      // вставляем значения
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      //Чтобы не съезжало в случае если слишком длинное описание где-то вылезет
      if (i % 2 != 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Если цена указана, то она дополняется долларом
  function insertItemPrice(html, pricePropName, priceValue) {
    // Если цены нет, вместо результата будет пустая строка
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  //Добавляет название порции (большая малая и тд)
  function insertItemPortionName(html, portionPropName, portionValue) {
    // Если не было указано названия порции то ничего не меняем, просто стираем маркер
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

global.$dc = dc;

}(window));
