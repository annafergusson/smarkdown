ocpu.seturl("https://cloud.opencpu.org/ocpu/apps/annafergusson/codesharey/R")

function interactive_encode(){
  $('.code-blank input').addClass("gap");
  $('.code-blank select').addClass("gap");
}

function encode(){
    // find all the code exercises
   $("p:contains('{sharecode}')").each(function (index) {
       $(this).replaceWith("<div>When you are finished, click this <button id='share_code' class='doc'>Share code</button> button to generate a link to your code.<br /><textarea id='share_link' style='width:100%; display:none;'></textarea></div>");
   });
   
  
   // find all the code exercises
   $("td:contains('{code}')").each(function (index) {
       var html = $(this).html();
       //get all the ps
       var code = "";
       var p_parts = html.split("</p>");
       for(var i = 1; i < p_parts.length - 1; i++){
         var checkText = p_parts[i] + "</p>";
         var inner = checkText.match("<p(.*)</p>");
         inner[0] = inner[0].replace("&nbsp;", "\t");
         code = code + inner[0];
         if(i < p_parts.length - 2){
           code = code + "\n";
         }
       }
       
       $(this).closest('table').replaceWith("<pre class='code-exercise'><code>" + code + "</code></pre>");
   });
   
   // find all the code blanks
    $("td:contains('{codeblank}')").each(function (index) {
       var html = $(this).html();
       $(this).closest('table').replaceWith("<pre class='code-blank'><code>" + html + "</code></pre>");
   });
  
   
   $(".code-blank code").each(function (index) {
     
        var newText = "";
        
        $(this).find("p").each(function (index) {
      
          $(this).find("span").each(function (index) {
            var old = $(this).html();
            if($(this).text() !== "{codeblank}"){
              old = old.replace("“", '"');
              old = old.replace("”", '"');
              old = old.replace("&nbsp;", "");
              newText = newText + old
            }
          })
          
          if($(this).text() !== "{codeblank}"){
            newText = newText + "\n";
          }
      
        })
      
      $(this).html(newText);
   })
  
   
   var editor;
   $('.code-exercise').each(function(index) {
      $(this).before("<div><button class='org' id='" + index + "'> <i class='fa fa-refresh' aria-hidden='true'></i>&nbsp;<small>Start over</small></button><button class='code' id='" + index + "'><i class='fa fa-play' aria-hidden='true'></i>&nbsp;<small>Run code</small></button><img class='loader mini' style='display:none; width:20px' id='" + index + "' src='mini-cat.gif' /></div><div style='clear:both'></div>")
     $(this).after("<div class='code-output'></div>");
     //stash original code in data
     var all_code = $(this).text();
     var code_parts = all_code.split("#####\n");
     var funs = "";
     var code = code_parts[0];
     if(code_parts.length > 1){
       funs = code_parts[0];
       code = code_parts[1];
     }
     $(this).attr("id",index);
     $(this).data("org-code", code);
     $(this).data("fun-code", funs);
     
     editor = ace.edit(this);
     //editor.setTheme("ace/theme/github");
     editor.getSession().setMode("ace/mode/r");
     editor.setFontSize("14px");
     editor.getSession().setUseWrapMode(true);
     editor.setOptions({maxLines: Infinity});
     editor.setHighlightActiveLine(false);
     editor.setShowPrintMargin(false);
     editor.setShowFoldWidgets(false);
     editor.setBehavioursEnabled(true);
     editor.renderer.setDisplayIndentGuides(false);
     editor.setValue(code);
     editor.session.getSelection().clearSelection();
     editor.session.insert({row: editor.session.getLength(),col: 0}, "\n");
   });
   
   $('.code-blank').each(function(index) {
      $(this).before("<div><button class='blank' id='" + index + "'><i class='fa fa-play' aria-hidden='true'></i>&nbsp;<small>Run code</small></button><img class='blanker mini' style='display:none; width:20px' id='" + index + "' src='mini-cat.gif' /></div><div style='clear:both'></div>");
     $(this).after("<div class='fake'></div>");
     //$(this).after("<div class='check'></div>");
     $(this).after("<div class='code-blank-output'></div>");
   });
   
   
   $(".code").click(function(){
       var id = $(this).attr("id");
       //disable this button
       $(this).prop('disabled', true);
       $('.loader:eq(' + id + ')').show();
       $('.code-exercise:eq(' + id + ')').each(function(index) {
      $(this).css("opacity",0.6);
	  $('.code-output:eq(' + id + ')').css("opacity",0.6);
       editor = ace.edit(this);
       //check for global custom functions
       var funx = "";
       if( $('.functions').length )  {
          funx = ($(".functions").text());
       }
       //check for local custom functions
       var fun_code = $(this).data("fun-code");
       var codeText = editor.getSession().getValue();
       var clearCache = "\nclear_cache <- " + new Date().getTime();
       var rmdText = "```{r echo=FALSE, message=FALSE, warning=FALSE, fig.width=10, fig.height=5}\n" + funx + "\n" + fun_code + "\n" + codeText + clearCache + "\n```";
       renderRmd(rmdText, id);
       })
    })
    
    $(".blank").click(function(){
       var id = $(this).attr("id");
       //disable this button
       $(this).prop('disabled', true);
       $('.blanker:eq(' + id + ')').show();
       
    $('.code-blank:eq(' + id + ')').each(function(index) {
        $(this).css("opacity",0.6);
  	    $('.code-blank-output:eq(' + id + ')').css("opacity",0.6);
  	    
         var codeText = $(this).html();
         $('.fake:eq(' + id + ')').html(codeText);
         
         var replaces = [];
         
         $('.code-blank:eq(' + id + ') .gap').each(function(index){
           replaces.push($(this).val());
         })
         
         $('.fake:eq(' + id + ') .gap').each(function(index){
           var cur_val = replaces[index];
           $(this).replaceWith(cur_val);
         })
         
          //codeText = $('.fake:eq(' + id + ')').text().replace(/\s\s+/g, ' ');
         codeText = $('.fake:eq(' + id + ')').text();
         var newText = codeText.split(",\n ").join(", ");
         //what are these magical spaces?
         newText = codeText.split(" ").join("");
        
         var clearCache = "\nclear_cache <- " + new Date().getTime();
         var rmdText = "```{r echo=FALSE, message=FALSE, warning=FALSE, fig.width=10, fig.height=5}\n" + newText + clearCache + "\n```";
         renderRmdBlank(rmdText, id);
       })
    })
    
    
  function renderRmd(textCode, id){
   var req = ocpu.call("rmdtext", {
      text : textCode
    }, function(session){
    $.get(session.getFileURL("output.html"),            function( data) {
    $('.code-output:eq(' + id + ')').html("");
    $('.code-output:eq(' + id + ')').html(data);     // make any HTML tables interactive
    $('.code-output:eq(' + id + ') > .kable-table > table').DataTable({searching: false, lengthChange: false, order: [] });
        })    
         $('.code:eq(' + id + ')').prop('disabled', false);
         $('.loader:eq(' + id + ')').hide();
         $('.code-exercise:eq(' + id + ')').css("opacity", 1);
         $('.code-blank-output:eq(' + id + ')').css("background-color", "#ffffff").css("padding", "10px");
		  $('.code-output:eq(' + id + ')').css("opacity",1);
         $('html,body').animate({scrollTop: $('.code-output:eq(' + id + ')').offset().top - 70}, 500);
    }).fail(function(text){
      $('.code-output:eq(' + id + ')').html("Error: " + req.responseText);
       $('.code-output:eq(' + id + ')').css("background-color", "#dcd0ff").css("padding", "10px");
       $('.code:eq(' + id + ')').prop('disabled', false);
       $('.loader:eq(' + id + ')').hide();
       $('.code-exercise:eq(' + id + ')').css("opacity", 1);
	    $('.code-output:eq(' + id + ')').css("opacity",1);
    });
   
  } 
  
 function renderRmdBlank(textCode, id){
   var req = ocpu.call("rmdtext", {
      text : textCode
    }, function(session){
    $.get(session.getFileURL("output.html"),            function( data) {
    $('.code-blank-output:eq(' + id + ')').html("");
    $('.code-blank-output:eq(' + id + ')').html(data);     // make any HTML tables interactive
    $('.code-blank-output:eq(' + id + ') > .kable-table > table').DataTable({searching: false, lengthChange: false, order: [] });
        })    
         $('.blank:eq(' + id + ')').prop('disabled', false);
         $('.blanker:eq(' + id + ')').hide();
          $('.code-blank-output:eq(' + id + ')').css("background-color", "#ffffff").css("padding", "10px");
         $('.code-blank:eq(' + id + ')').css("opacity", 1);
		  $('.code-blank-output:eq(' + id + ')').css("opacity",1);
         $('html,body').animate({scrollTop: $('.code-blank-output:eq(' + id + ')').offset().top - 70}, 500);
    }).fail(function(text){
      $('.code-blank-output:eq(' + id + ')').html("Error: " + req.responseText);
       $('.code-blank-output:eq(' + id + ')').css("background-color", "#dcd0ff").css("padding", "10px");
       $('.blank:eq(' + id + ')').prop('disabled', false);
       $('.blanker:eq(' + id + ')').hide();
       $('.code-blank:eq(' + id + ')').css("opacity", 1);
	    $('.code-blank-output:eq(' + id + ')').css("opacity",1);
    });
   
  } 
  
  $(".org").click(function(){
       var id = $(this).attr("id");
       $('.code-exercise:eq(' + id + ')').each(function(index) {
        editor = ace.edit(this);
        var org_code = $(this).data("org-code");
        editor.setValue(org_code);
        editor.session.getSelection().clearSelection();
        editor.session.insert({row: editor.session.getLength(),col: 0}, "\n");
       })
    })
    
  $("#share_code").click(function(){
    $(this).prop('disabled', true);
    $("#share_link").val("");
    $("#share_link").hide();
    
    //assuming only one on the page
    var id = $(".code-blank")
    var codeText = id.html();
    var fake = $(".fake")
    fake.html(codeText);
    
    var replaces = [];
     $('.code-blank .gap').each(function(index){
       replaces.push($(this).val());
     })
     $('.fake .gap').each(function(index){
       var cur_val = replaces[index];
       $(this).replaceWith(cur_val);
     })
    
    codeText = fake.text();
    var newText = codeText.split(",\n ").join(", ");
    newText = codeText.split(" ").join("");
    
    if(newText == ""){
      $(".code-exercise").each(function(index) {
        var editor = ace.edit(this);
        newText = editor.getSession().getValue();
      })
    }
    
     // get text link from csvmonster
     var data = "t=" + newText;
     var textMonster = "https://csv.monster/textLink.php";
     $.post(textMonster, { t: newText} ).done    (function( data ) {
     var sharesy = "https://annafergusson.ocpu.io/codesharey/www/?code=" + data;
        $("#share_link").val(sharesy); 
        $("#share_link").show();
        $("#share_code").prop('disabled', false);
      });
  })

  
}