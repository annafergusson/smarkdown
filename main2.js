
$(function() {
  reveal();
});

function reveal(){
  var page = "";
  var searchParams = new URLSearchParams(window.location.search);
  if(searchParams.has('page')){
    page = searchParams.get('page');
  } 
  var draft = "";
  if(searchParams.has('draft')){
    draft = searchParams.get('draft');
  } 
  getHTML(page, "all", draft);
}

function getHTML(page, opt, draft) {
//$("#footer").hide();
$(".loading").show();

var html = "https://script.google.com/macros/s/AKfycbylcifhkPPszObyyn7aUptXjh_ylFJxqtFFmnyoaDUFAoS4ePLf/exec";

if(page !== ""){
  html = html + "?page=" + page;
}

if(draft !== ""){
  html = html + "&draft=" + draft
} 

fetch(html)
  .then(response => response.text())
  .then(data => showHTML(data, opt));
}

function showHTML(page, opt) {
  page = JSON.parse(page);
  
  // show page content
  updatePageHTML(page[1]);
  
  if(opt == "all")
  {
    // build side menu
    for(var i = 0; i < page[0].length; i++){
      var item = page[0][i];
      var class_name = "menu_" + item.type;
      var label = item.label;
      var slug = item.slug;
      var div = "<div id='" + slug + "' class='menu " + class_name + "'>" + label + "</div>";
      if(slug !== ""){
        div = "<div id='" + slug + "' class='menu " + class_name + "' onclick='getNewHTML(\"" + slug + "\")'>" + label + "</div>";
      }
      $("#side_menu").append(div);
    }
  }
  
  $(".loading").hide();
  $(".menu").css("opacity", 1);
  $("#" + page[2]).css("opacity", 0.5);
  
}

function updatePageHTML(data){
  $('#content').html(data.html);
  $('html,body').scrollTop(0);
  $(document).prop('title', data.label);
  if(data.pdf !== ""){
    $('#download').html("<a href='" + data.pdf + "'>Download this page as a PDF</a>");
  } else {
    $('#download').html("");
  }
  progressive();
  interactive();
  encode();
  interactive_encode()
  $("img").addClass("responsive");
  //$("#footer").show();
  
  //check for callout boxes
  $("p:contains('{quote}')").each(function (index) {
      var html = $(this).html();
      html = html.replace("{quote}", "");
      html = "<div class='quote'>" + html + "</div>";
      $(this).html(html);
  });
   $("p:contains('{callout}')").each(function (index) {
      var html = $(this).html();
      html = html.replace("{callout}", "");
      html = "<div class='callout'>" + html + "</div>";
      $(this).html(html);
  });
   $("p:contains('{outline}')").each(function (index) {
      var html = $(this).html();
      html = html.replace("{outline}", "");
      html = "<div class='outline'>" + html + "</div>";
      $(this).html(html);
  });
  
  //format learning objectives
   $("li:contains('{LO}')").parent().each(function (index) {
		  var lis = $(this).find('> li');
		  $(lis[0]).remove();
      //var html = $(this).html();
      //html = "<div class='quote'>" + html + "</div>";
      //$(this).html(html);
      $(this).wrap( "<div class='quote'></div>" );
  });
  $(".quote li").css("background-color", "#F0F0F0");
}

function getNewHTML(page){
  //check if same page?
  var cur_page = "";
  var searchParams = new URLSearchParams(window.location.search);
  if(searchParams.has('page')){
    cur_page = searchParams.get('page');
  }
  var draft = "";
  if(searchParams.has('draft')){
    draft = searchParams.get('draft');
  } 
  
  if(cur_page !== page){
    updateURL("page", page);
    updateURL("draft", draft);
    getHTML(page, "page", draft);
  } 
  
}


function changePar(par, val, q){
  var update_q = "";
  if(q !== ""){
  q = q.replace("?","");
  var pars = q.split("&");
  var new_q = [];
  var found = 0;
  
  for(var i = 0; i < pars.length; i++)
  {
      var vals = pars[i].split("=");
    var new_val = vals[1];
    if(vals[0] == par)
    {
      found = 1;
  	new_val = val;
  	if(new_val !== "")
      {
        new_q.push(vals[0] + "=" + new_val);
      }
    }
    else
    {
       new_val = vals[1];
  	 new_q.push(vals[0] + "=" + new_val);
    }
  }
  
  if(found == 0 && val !== ""){new_q.push(par + "=" + val);}
  if(new_q.length > 0){
    update_q = "?" + new_q.join("&");}                                    
  }
  else
  {
     if(val !== "")
   {
  	update_q = "?" + par + "=" + val;
   }
   else
   {
      update_q = "?";
   }
  }
  return update_q;
}

function updateURL(par, val)
{
  var str = window.location.search;
  str = changePar(par, val, str);
  window.history.pushState({}, null, str);
}

var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

// listen to popstate events
$(window).bind('popstate', function (event) {
  // Ignore inital popstate that some browsers fire on page load
  var initialPop = !popped && location.href == initialURL
  popped = true
  if (initialPop) return;
  var page = "";
  var searchParams = new URLSearchParams(window.location.search);
  if(searchParams.has('page')){
    page = searchParams.get('page');
  }
  getHTML(page, "page");
});


