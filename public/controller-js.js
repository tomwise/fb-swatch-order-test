window.swatchTestRunning = false;
window.swatchTestApplyActions = false;
window.swatchMboxes = [];

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

applySwatchOrderPLP = function(element, json, variant) {
  var swatchContainer = element.find('.swatch-list')
  for(var i=0; i<json.colors.length; i++) {
    var swatch = element.find('input[id^="swatch-'+json.colors[i]+'"]');
    if(swatch.length > 0) {
      var parent = swatch.closest('.swatch-list');      
      var item = swatch.closest('.swatch-cont');
      if(parent.find('.at-color-order').length > 0) {
        item.addClass('at-color-order').insertAfter(parent.find('.at-color-order').last());
      } else {
        item.addClass('at-color-order').prependTo(parent);
      }
    }
  }
  if(variant == 'b') {
    var firstSwatch = element.find('.swatch-input').first();
    if(!firstSwatch.is(':checked')) {
      if(firstSwatch.attr('id').indexOf("slicedId") < 1) {
        firstSwatch.trigger('click');  
      }
    }
  }
}

applySwatchOrderPDP = function(element, json, variant) {
  for(var i=0; i<json.colors.length; i++) {
    var swatch = element.find('.color-attribute[data-attr-value="'+json.colors[i]+'"]');
    if(swatch.length > 0) {
      var parent = swatch.closest('ul');
      var item = swatch.closest('li');
      if(parent.find('.at-color-order').length > 0) {
        item.addClass('at-color-order').insertAfter(parent.find('.at-color-order').last());
      } else {
        item.addClass('at-color-order').prependTo(parent);
      }
    }
  }
}

window.applySwatchOrdering = function(variant){
  if(window.swatchTestApplyActions === false) {
    window.swatchTestApplyActions = true;
    $.initialize(".at-swatch-order-eligible", function(index){
      var jsonString = $(this).attr('data-swatch-json');
      if(isJsonString(jsonString)) {
        var json = JSON.parse(jsonString);
        if(json.colors.length > 0) {
          if(utag_data.page_type == 'category') {
            applySwatchOrderPLP($(this), json, variant);
          } else if(utag_data.page_type == 'pdp') {
            applySwatchOrderPDP($(this), json, variant);
          }
        }
      }
    });  
  }
}


function deferSwatchOrder(method) {
    if (window.jQuery && jQuery().initialize) {
        method();
    } else {
        setTimeout(function() { deferSwatchOrder(method) }, 50);
    }
}

function triggerMBOX(name) {
  var mboxObj = {
    "mbox": name, 
    "success": function(offers) {           
      adobe.target.applyOffer( {  
         "mbox": name, 
         "offer": offers  
      } ); 
    },   
    "error": function(status, error) {           
      if (console && console.log) { 
        console.log(status); 
        console.log(error); 
      } 
    }, 
    "timeout": 5000 
  }

  var params = {
    "breakpoint" : $(window).width(),
    "page.type": utag_data.page_type, 
    "page.name": utag_data.page_name,
    "site.branding": utag_data.site_branding,
    "entry.brand": utag_data.entry_brand,
    "user.country": utag_data.user_country_ge,
    "user.currency": utag_data.user_currency_ge,
  }

  mboxObj.params = params;

  var deferCount = 0;
  function deferMBOX(method) {
    deferCount++;
    if (typeof adobe !== 'undefined' && typeof adobe.target !== 'undefined') {
      method();
      return true;
    }
    if(deferCount < 50) {
      setTimeout(function() { deferMBOX(method) }, 50);
    }
  }
  deferMBOX(function(){
    adobe.target.getOffer(mboxObj);      
  }, 50);

}

function checkAndLaunchMbox(mbox) {
  if(swatchMboxes.length < 1) {
    triggerMBOX(mbox);
    swatchMboxes.push(mbox);
  } else {
    var alreadyRunning = false;
    for(var i=0; i<swatchMboxes.length; i++) {
      if(swatchMboxes[i] == mbox) {
        alreadyRunning = true;
        break;
      }
    }
    if(alreadyRunning === false) {
      triggerMBOX(mbox);
      swatchMboxes.push(mbox);  
    }
  }
  
}

function checkForEntry(element, pid) {
  var foundMatch = null;
  var mbox = null;
  for(var i = 0; i < window.swatchJSON.length; i++) {
    var obj = window.swatchJSON[i];
    for(var m=0; m<obj.data.length; m++) {
      var dataItem = obj.data[m];
      if(pid == dataItem.id) {
        foundMatch = dataItem;
        mbox = obj.mbox;
        break;
      }
    }
    if(foundMatch) {
      break;
    }
  }
  if(foundMatch) {
    var jsonString = JSON.stringify(foundMatch);
    element.attr('data-swatch-json', jsonString).addClass('at-swatch-order-eligible');
    checkAndLaunchMbox(mbox);
  }
}

deferSwatchOrder(function () {
  if(utag_data.page_type == 'category') {

    $.initialize(".product-tile", function(index){
      if(!$(this).hasClass('at-swatch-order-init')){
        $(this).addClass('at-swatch-order-init');
        var pid = $(this).attr('data-pid');
        if(pid !== undefined) {
          checkForEntry($(this), pid);
        }
      }
    });

  } else if(utag_data.page_type == 'pdp') {
    $.initialize(".product-detail", function(index){
      if(!$(this).hasClass('at-swatch-order-init')){
        $(this).addClass('at-swatch-order-init');
        var pid = $(this).attr('data-pid');
        if(pid !== undefined) {
          checkForEntry($(this), pid);
        }
      }
    });

  }

});