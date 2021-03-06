// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

function num2letterID(num) {
    // Takes an positive integer and translates it into a unique letter ID.
    // Examples: 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB, 51 -> AZ, 52 -> BA.
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    ID = alphabet[num % 26];
    return num <= 25 ? ID : alphabet[Math.floor(num/26)-1] + ID
}

function clickTip(obj, txt) {
  // Handles tip text in form elements when clicked
  if (obj.value == txt) obj.value=""; 
  obj.className = "formInput";
}

function blurTip(obj, txt) {
  // Handles tip text in form elements when blurred
  if (obj.value != "") return;
  obj.className = "formInputTip";
  obj.value = txt;
}

function toggleHeaderSubnav(link) {
  if ($(link).parents('.subnavtab').hasClass('open')) {
    closeHeaderSubnav(link);
  } else {
    openHeaderSubnav(link);
  }
}

function openHeaderSubnav(link) {
  $('.subnav').hide();
  $('.subnavtab').removeClass('open');
  $(link).parents('.subnavtab').addClass('open');
  $(link).parents('li').find('.subnav').show();
  $(document).click(subnavClickOff);
}

function closeHeaderSubnav(link) {
  $(link).parents('.subnavtab').removeClass('open');
  $(link).parents('li').find('.subnav').hide();
  $(document).unbind('click', subnavClickOff);
}

function subnavClickOff(e) {
  if ($(e.target).parents('.subnavwrapper').length == 0) {
    $('.subnav').hide();
    $('.subnavtab').removeClass('open');
  }
}
var QTIP_DEFAULTS = {
  hide: {
    fixed: true
  },
  style: {
    classes: 'ui-tooltip-light ui-tooltip-shadow',
    width: 'auto'
  },
  position: {
    viewport: $(window)
  }
}


$('a[data-loading-click], input[data-loading-click][type=radio], input[data-loading-click][type=checkbox]').live('click', loadingClickForLink)

function loadingClickForLink() {
  var txt = $(this).attr('data-loading-click')
  if ($.trim($(this).attr('data-loading-click')) == 'true') { txt = 'Loading...' }
  var loading = $(this).clone()
  loading.unbind()
  loading.attr('onclick', 'return false;')
  loading
    .attr('id', '')
    .addClass('loadingclick')
    .css('padding-left', '25px')
    .html(txt)
  loading.click(function(e){
    e.preventDefault()
    return false
  })
  if (txt == '') {
    loading.find('span').html(".").css('visibility', 'hidden').css('width', '0px')
  }
  $(this).hide().before(loading)
}

$('input[data-loading-click][type=text], input[data-loading-click][type=submit]').live('click', function() {
  var txt = $.trim($(this).attr('data-loading-click'))
  if ($.trim($(this).attr('data-loading-click')) == 'true') { txt = 'Saving...' }
  $(this).addClass('disabled description').val(txt)
  var link = this
  
  if (!$(this).attr('data-loading-click-bound')) {
    $(this).parents('form').bind('ajax:success', function() {
      $(link).attr('disabled', false).removeClass('disabled description')
    })
    $(this).attr('data-loading-click-bound', true)
  }
  
  $(this).parents('form').submit(function() {
    $(link).attr('disabled', true)
  })
})

$('[data-autosubmit]').live('change', function() {
  $(this).parents('form').submit()
})

function buildHelpTips() {
  if (typeof($().qtip) == "undefined") { return; }
  var options = $.extend(true, {}, QTIP_DEFAULTS, {
    show: {event: 'click'},
    hide: {event: 'unfocus'}
  })
  $('.helptip').not('.helptipified').each(function() {
    $(this).addClass('helptipified')
    var content
    if ($(this).attr('rel') && $(this).attr('rel').match(/^#/)) {
      content = $($(this).attr('rel')).html()
    } else {
      content = $(this).attr('rel')
    }
    
    var tipOptions = $.extend(true, {}, options, {
      content: {
        text: content, 
        title: $(this).attr('data-helptip-title')
      }
    })
    if ($(this).attr('data-helptip-width')) {
      tipOptions.style = tipOptions.style || {}
      tipOptions.style.width = $(this).attr('data-helptip-width')
    }
    $(this).qtip(tipOptions)
  })
}

$(document).ready(function() {
  function makeHeaderLinkCurrent(li) {
    $(li).addClass('current').append(
      $('<img src="/images/active_tab_bottom.gif">').css({
        position: "absolute",
        left: '50%',
        bottom: '-6px',
        marginLeft: '-5px'
      })
    )
  }
  if (window.location.pathname.match(/^\/observations/)) {
    makeHeaderLinkCurrent('#mainnav .observationstab')
  } else if (window.location.pathname.match(/^\/taxa/)) {
    makeHeaderLinkCurrent('#mainnav .taxatab')
  } else if (window.location.pathname.match(/^\/projects/)) {
    makeHeaderLinkCurrent('#mainnav .projectstab')
  } else if (window.location.pathname.match(/^\/places/)) {
    makeHeaderLinkCurrent('#mainnav .placestab')
  } else if (window.location.pathname.match(/^\/user/) || window.location.pathname.match(/^\/people/)) {
    makeHeaderLinkCurrent('#mainnav .peopletab')
  }
  
  buildHelpTips()
  
  $('#usernav .signin_link, #usernav .signup_link').click(function() {
    if (window.location.pathname != '' && window.location.pathname != '/') {
      window.location = $(this).attr('href') + '?return_to=' + window.location
      return false
    }
  })
  
  $([
    '/images/spinner.gif',
    '/images/spinner-small.gif',
    '/images/spinner-small-ffffff_on_dedede.gif',
    '/images/spinner-small-ffffff_on_aaaaaa.gif'
  ]).preload()
  
  $('[data-tip]').each(autoTip)
  
  $('.source_nested_form_fields input.existing').chooser({
    collectionUrl: 'http://'+window.location.host + '/sources.json',
    resourceUrl: 'http://'+window.location.host + '/sources/{{id}}.json'
  })
  
  $('.zoomable').zoomify()
  
  $('.delayedlink').click(function() {
    window.delayedLinkTries = 0
    var dialog = $('#delayedlinknotice'),
        msg = $(this).attr('data-delayed-link-msg') || 'Hold on while we generate that file...',
        status = $('<div class="loading status"></div>').html(msg)
    if (dialog.length == 0) {
      dialog = $('<div id="delayedlinknotice"></div>')
      $(document.body).append(dialog)
    }
    dialog.html(status)
    dialog.dialog({modal: true, title: 'Hold on...'})
    checkDelayedLink($(this).attr('href'))
    return false
  })
  
  $('#headerupdatesnotice').click(function() {
    toggleHeaderSubnav(this)
    if (!$('#updatessubnav').data('loaded')) {
      $('#updatessubnav').load('/users/new_updates', function(data) {
        $(this).html(data)
        $('#updatessubnav').data('loaded', true)
        setUpdatesCount(0, {skipAnimation: true})
        var tipOptions = $.extend(true, {}, QTIP_DEFAULTS, {
          position: {
            my: 'right center',
            at: 'left center',
            target: 'event'
          },
          content: {
            text: '<span class="loading status">Loading...</span>',
            ajax: {
              type: 'GET',
              data: {partial: 'cached_component'}
            }
          }
        })
        tipOptions.style.classes += ' compact mini observations'
        tipOptions.style.width = 250
        $('li a[href*="/observations/"]', this).each(function() {
          tipOptions.position.target = $(this).parents('li:first')
          tipOptions.content.ajax.url = $(this).attr('href')
          $(this).qtip(tipOptions)
        })
      })
    }
    return false
  })
})

function checkDelayedLink(url) {
  if (window.delayedLinkTries > 20) {
    $('#delayedlinknotice').dialog('close')
    alert('Your request for ' + url + ' seems to be taking forever.  Please try again later.')
    return
  }
  $.ajax({
    url: url,
    type: 'get',
    statusCode: {
      // Accepted: request acnkowledged byt file hasn't been generated
      202: function() {
        setTimeout('checkDelayedLink("'+url+'")', 5000)
      },
      // OK: file is ready
      200: function() {
        $('#delayedlinknotice').dialog('close')
        window.location = url
      }
    }
  })
}

function autoTip() {
  if ($(this).attr('data-tip').match(/^#/)) {
    content = $($(this).attr('data-tip')).html()
  } else {
    content = $(this).attr('data-tip')
  }
  var tipOptions = $.extend(true, {}, QTIP_DEFAULTS)
  if ($(this).attr('data-tip-title')) {
    tipOptions.content = {
      text: content, 
      title: $(this).attr('data-helptip-title')
    }
  } else {
    tipOptions.content = content
  }
  
  if ($(this).attr('data-tip-show-delay')) {
    tipOptions.show = tipOptions.show || {}
    tipOptions.show.delay = parseInt($(this).attr('data-tip-show-delay'))
  }
  
  if ($(this).attr('data-tip-width')) {
    tipOptions.style = tipOptions.style || {}
    tipOptions.style.width = $(this).attr('data-tip-width')
  }
  
  if ($(this).attr('data-tip-style-classes')) {
    tipOptions.style = tipOptions.style || {}
    tipOptions.style.classes = $(this).attr('data-tip-style-classes')
  }
  
  if ($(this).attr('data-tip-position-at')) {
    tipOptions.position = tipOptions.position || {}
    tipOptions.position.at = $(this).attr('data-tip-position-at')
  }
  
  $(this).qtip(tipOptions)
}

// from http://forum.jquery.com/topic/jquery-simple-autolink-and-highlight-12-1-2010
jQuery.fn.autolink = function() {
  return this.each(function() {
    var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
    $(this).html( $(this).html().replace(re, '<a href="$1">$1</a> ') );
  })
}

$.fn.preload = function() {
  this.each(function(){ $('<img/>')[0].src = this; })
}

$('.ui-widget-overlay, .shades').live('click', function() {
  $('.dialog:visible').dialog('close')
})

$.fn.shades = function(e, options) {
  options = options || {}
  elt = this[0]
  switch (e) {
    case 'close':
      $(elt).find('.shades:last').hide()
      break;
    case 'remove':
      $(elt).find('.shades:last').remove()
      break;
    default:
      var shades = $(elt).find('.shades:last')[0] || $('<div class="shades"></div>'),
          underlay = $('<div class="underlay"></div>'),
          overlay = $('<div class="overlay"></div>').html(options.content)
      $(shades).html('').append(underlay, overlay)
      if (options.css) { $(underlay).css(options.css) }
      if (elt != document.body) {
        $(elt).css('position', 'relative')
        $(shades).css('position', 'absolute')
        $(underlay).css('position', 'absolute')
      }
      $(elt).append(shades)
      $(shades).show()
      break;
  }
}

$.fn.showInlineBlock = function() {
  var opts = {}
  if ($.browser.msie) {
    opts.zoom = 1
    opts.display = 'inline'
    opts['*display'] = 'inline'
  } else {
    opts.display = 'inline-block'
  }
  $(this).css(opts)
  return this
}

$.fn.selectLocalTimeZone = function() {
  $(this).each(function() {
    var option
    var now = new Date(),
        timeZoneAbbr = now.toString().match(/\(([A-Z]{3})\)$/)[1],
        timeZoneOffsetHour = now.toString().match(/([+-]\d\d)(\d\d)/)[1]
        timeZoneOffsetMinute = now.toString().match(/([+-]\d\d)(\d\d)/)[2]
    if (timeZoneAbbr) {
      var matches = $("option[data-time-zone-abbr='"+timeZoneAbbr+"']", this)
      option = matches.first()
    } else if (timeZoneOffsetHour) {
      var formattedOffset = timeZoneOffsetHour + ':' + timeZoneOffsetMinute
      var matches = $("option[data-time-zone-formatted-offset='"+formattedOffset+"']", this)
      option = matches.first()
    }
    if (option) {
      $(this).val(option.val())
    }
  })
  return this
}

$.fn.disable = function() { $(this).attr('disabled', true).addClass('disabled') }
$.fn.enable = function() { $(this).attr('disabled', false).removeClass('disabled') }
$.fn.toggleDisabled = function() { $(this).hasClass('disabled') ? $(this).enable() : $(this).disable() }

$.fn.zoomify = function() {
  var selection = $(this).not('.zoomified')
  selection
    .addClass('zoomified')
    .addClass('inlineblock')
    .append('<img src="/images/silk/magnifier.png" class="zoom_icon"/>')
  selection.click(function() {
    if ($('#zoomable_dialog').length == 0) {
      $(document.body).append(
        $('<div></div>').attr('id', 'zoomable_dialog').addClass('dialog')
      )
    }
    $('#zoomable_dialog').html('<div class="loading status">Loading...</div>')
    $('#zoomable_dialog').load($(this).attr('href'), "partial=photo", function() {
      
      $('img', this).load(function() {
        var dialog = $('#zoomable_dialog'),
            newHeight = $(':first', dialog).height() + 60,
            maxHeight = $(window).height() * 0.8
        if (newHeight > maxHeight) { newHeight = maxHeight };
        $(dialog).dialog('option', 'height', newHeight)
        $(dialog).dialog('option', 'position', {my: 'center', at: 'center', of: $(window)})
      })
    })
    $('#zoomable_dialog').dialog({
      modal: true, 
      title: $(this).attr('title') || $(this).attr('alt'),
      width: $(window).width() * 0.8
    })
    return false
  })
}

$.fn.slideToggleWidth = function() {
  $(this).each(function() {
    if ($(this).attr('data-original-width') && $(this).attr('data-original-width') != $(this).width()) {
      $(this).show()
      $(this).animate({
        width: $(this).attr('data-original-width')
      }, 500)
    } else {
      $(this).attr('data-original-width', $(this).width())
      $(this).animate({width:0}, 500, function() {$(this).hide()})
    }
  })
}

$.fn.centerInContainer = function(options) {
  options = options || {}
  var containerSelector = options.container || ':first'
  $(this).not('.centeredInContainer').each(function() {
    if ($(this)) {};
    var containerWidth = $(this).parents(containerSelector).width(),
        containerHeight = $(this).parents(containerSelector).height(),
        w = $(this).naturalWidth(),
        h = $(this).naturalHeight()
    if (w > h) {
      var width = containerHeight / h * w
      $(this).css({height: containerHeight, maxWidth: 'none'})
      $(this).css({top: 0, left: '50%', marginLeft: '-' + (width / 2) + 'px'})
    } else if (w < h) {
      var height = containerWidth / w * h
      $(this).css({width: $(this).parents(containerSelector).width(), maxHeight: 'none'})
      $(this).css({left: 0, top: '50%', marginTop: '-' + (height / 2) + 'px'})
    } else if (w == 0 && h == 0) {
      var that = this
      // hack for ff
      setTimeout(function() {
        $(that).centerInContainer(options)
      }, 500)
      return
    } else {
      $(this).css({width: $(this).parents(containerSelector).width(), maxWidth: 'none', maxHeight: 'none'})
      $(this).css({left: 0, top: 0, marginTop: '0px'})
    }
    $(this).addClass('centeredInContainer')
  })
}

$.fn.observationsGrid = function(size) {
  $(this).removeClass('mini map')
  $(this).addClass('observations grid')
  $('.observation', this).showInlineBlock()
  $('.map', this).hide()
  var that = this
  if (size == 'medium') {
    $(this).addClass('medium')
    $('.photos img[data-small-url]', this).each(function() { 
      $(this).load(function() {
        $(this).centerInContainer({container: '.observation:first'})
        $(this).fadeIn()
        $(this).unbind('load')
      })      
      $(this).attr('src', $(this).attr('data-small-url'))
      if (!$.browser.msie) {
        $(this).hide()
      }
    })
    $('.icon img[data-small-url]', this).each(function() {
      $(this).attr('src', $(this).attr('data-small-url')) 
    })
  } else {
    $(that).removeClass('medium')
    $('.photos img[data-square-url]', that).attr('style', '')
    $('.photos img[data-square-url]', that).removeClass('centeredInContainer')
    $('.photos img[data-square-url]', that).attr('src', function() { return $(this).attr('data-square-url')})
    $('.icon img[data-square-url]', that).attr('src', function() { return $(this).attr('data-square-url')})
  }
}

$.fn.observationsList = function() {
  $('.observation', this).show().css('display', 'block')
  $('.map', this).hide()
  $(this).removeClass('medium grid map')
  $(this).addClass('mini')
  $('.photos img[data-square-url]', this).attr('style', '')
  $('.photos img[data-square-url]', this).removeClass('centeredInContainer')
  $('.photos img[data-square-url]', this).attr('src', function() { return $(this).attr('data-square-url')})
  $('.icon img[data-square-url]', this).attr('src', function() { return $(this).attr('data-square-url')})
}

$.fn.observationsMap = function() {
  $(this).observationsList()
  $(this).removeClass('medium grid mini')
  $(this).addClass('map')
  $(this).each(function() {
    if ($('.map', this).length > 0) {
      $('.map', this).show()
      google.maps.event.trigger($('.map', this).get(0), 'resize')
      return
    }
    var w = $(this).width(),
        h = $(window).height() / $(window).width() * w,
        mapDiv = $('<div></div>')
    mapDiv.addClass('stacked map')
    mapDiv.width(w)
    mapDiv.height(h)
    $(this).prepend(mapDiv)
    var map = iNaturalist.Map.createMap({div: mapDiv.get(0)})
    $('.observation', this).each(function() {
      var o = {
        id: $(this).attr('id').split('-')[1],
        latitude: $(this).attr('data-latitude'),
        longitude: $(this).attr('data-longitude'),
        taxonId: $(this).attr('data-taxon-id'),
        iconic_taxon: {
          name: $(this).attr('data-iconic-taxon-name')
        }
      }
      map.addObservation(o)
    })
    map.zoomToObservations()
  })
  $('.observation', this).hide()
}


$.fn.observationControls = function(options) {
  var options = options || {}
  $(this).each(function() {
    var observations = options.div || $(this).parent().find('.observations')
    var gridButton = $('<a href="#"><span class="inat-icon ui-icon ui-icon-grid inlineblock">&nbsp;</span>Grid</a>')
    gridButton.data('gridSize', $(observations).hasClass('medium') ? 'medium' : null)
    gridButton.click(function() {
      $(observations).observationsGrid($(this).data('gridSize'))
      $(this).siblings().addClass('disabled')
      $(this).removeClass('disabled')
      return false
    })

    var listButton = $('<a href="#"><span class="inat-icon ui-icon ui-icon-list inlineblock">&nbsp;</span>List</a>')
    listButton.click(function() {
      $(observations).observationsList()
      $(this).siblings().addClass('disabled')
      $(this).removeClass('disabled')
      return false
    })

    var mapButton = $('<a href="#"><span class="inat-icon ui-icon ui-icon-map inlineblock">&nbsp;</span>Map</a>')
    mapButton.click(function() {
      $(observations).observationsMap()
      $(this).siblings().addClass('disabled')
      $(this).removeClass('disabled')
      return false
    })
    
    $(this).append(' ', gridButton, listButton, mapButton)

    if ($(observations).hasClass('grid')) {
      gridButton.click()
    } else if ($(observations).hasClass('map')) {
      mapButton.click()
    } else {
      listButton.click()
    }
  })
}

$.fn.naturalWidth = function() {
  var img = $(this).get(0)
  var fakeImg = new Image()
  fakeImg.src = $(this).attr('src')
  return fakeImg.width
}

$.fn.naturalHeight = function() {
  var img = $(this).get(0)
  var fakeImg = new Image()
  fakeImg.src = $(this).attr('src')
  return fakeImg.height
}


function setUpdatesCount(count, options) {
  options = options || {}
  if (count > 0) {
    if (options.skipAnimation) {
      $('#header .updates').addClass('alert')
    } else {
      $('#header .updates').switchClass('', 'alert')
    }
    $('#header .updates .count').html(count)
  } else {
    if (options.skipAnimation) {
      $('#header .updates').removeClass('alert')
    } else {
      $('#header .updates').switchClass('alert', '')
    }
    $('#header .updates .count').html(0)
  }
}

function getUpdatesCount() {
  $.get('/users/updates_count', function(data) {
    setUpdatesCount(data.count)
  })
}

$.fn.subscriptionSettings = function() {
  var options = $.extend(true, {
    position: {
      my: 'top right',
      at: 'bottom center'
    },
    show: {
      event: 'click'
    },
    hide: {
      event: 'unfocus'
    },
    content: {
      text: '<span class="loading status">Loading...</span>',
      ajax: {
        type: 'GET',
        data: {partial: 'edit_inline'},
        error: function(jqXHR, textStatus, errorThrown) {
          this.set('content.text', "<div class='meta'>You're no longer subscribed to that item.</div>")
        },
        success: function(data, status) {
          this.set('content.text', data);
          $('.taxonchooser', this.elements.content).simpleTaxonSelector({
            afterSelect: function(wrapper, taxon, options) {
              var form = $(wrapper).parents('form:first'),
                  data = form.serialize() + '&format=json'
              $.ajax({
                url: form.attr('action'),
                type: 'post',
                data: data
              })
            }
          })
          $('.createdestroy form', this.elements.content).submit(function() {
            $(this).fadeOut(function() {
              $(this).siblings('form').fadeIn()
            })
            var data = $(this).serialize() + '&format=json'
            $.ajax({
              url: $(this).attr('action'),
              type: 'post',
              data: data
            })
            return false
          })
        }
      }
    }
  }, QTIP_DEFAULTS)
  $(this).each(function() {
    options.content.ajax.url = $(this).attr('href')
    $(this).qtip(options)
    $(this).click(function() {return false})
  })
}

// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
Array.prototype.unique = function() {
  var o = {}, i, l = this.length, r = [];
  for(i=0; i<l;i+=1) o[this[i]] = this[i];
  for(i in o) r.push(o[i]);
  return r;
}

// http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
}
