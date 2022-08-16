function progressive() {
  var html = $(".page").html();
  var sections = html.split("<hr>");
  var new_html = [];
  for(var i = 0; i < sections.length; i++)
  {
      new_html.push("<div class='section'>" + sections[i] + "</div>");
  }
  
  if(sections.length > 1){
    var xtra_html = new_html.join("") + "<div class='xtra'></div>";
    $(".page").html(xtra_html);
  }
  
  //add next buttons etc.
  $(".section").each(function(index){
     if(index < $('.section').length - 1)
     {
      $(this).append('<div style="clear:both"></div><button class="nexty">Next</button>');
      }
  })
  
  $(".section").css("display","none");
  $(".nexty").css("display","none");
  
  $(".section").first().css( "display", "");
  $(".nexty").first().css( "display", "");
  
   if(sections.length > 1){
    $(".xtra").height(400);
   }
  
  $(".nexty").click(function(){
     
      $(this).parent().next().css("display","")
      
      $('html,body').animate({scrollTop: $(this).offset().top}, 500);
      
      var next_section = $(this).parent().next().next().attr('class');
      if(next_section !== "xtra")
      {
          $(this).parent().next().children(".nexty").css("display","");
      }
      
      $(this).css("display","none");
  })
  
  //add sandbox stuff to iframes
  //sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
  $("iframe").each(
     function(index, elem) {
         elem.setAttribute("sandbox","allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation");
     }
 );
}

function interactive() {

  //display embedded iframes
     $("span:contains('</iframe>')").each(function (index) {
        var checkText = $(this).text().trim();
        var ans = checkText.match("<iframe(.*)</iframe>");
        $(this).html(ans[0]);
  });
  
  // find reveal buttons
     $("p:contains('{showanswers}')").each(function (index) {
      $(this).replaceWith("<button id='showAnswers' class='doc'>Show all answers</button>");
   });
  

  

  //might regret this later, but make all a links open in new tab?
  
  $("a").attr('target', '_blank');


   //create HTML-------------------------------------------------
   
   // find predict images (must come in pairs)
   pred_images = [];
   points = [];
   draw = [];
   
   //find cells in html tables with images
   $("td:contains('{predict}')").each(function (index) {
       var temp = [];
       $(this).find('img').each(function (index) {
           temp.push($(this).attr("src"));
       })
       pred_images.push(temp);
       $(this).closest('table').replaceWith("<div class='prediction'></div>");
   });
   
   
   //make the interactives
   $(".prediction").each(function (index) {
     if(pred_images[index].length > 0)
     {
       var canvas_id = "canvas" + index;
       var image1 = pred_images[index][0];
       $('<canvas>').addClass('predict').attr('id', canvas_id).css({width:'90%'}).appendTo(this);
       //add the globals for points/drawing
       draw[index] = 0;
       points.push([]);
       make_base(index, canvas_id);
       var new_div = $(this).append("<div style='clear:both'></div>");
       $('<button>').html("Reset plot").addClass('sec').attr('id', "reset" + index).css('float','right').appendTo(new_div);
       if(pred_images[index].length > 1)
       {
          var image2 = pred_images[index][1];
          $('<button>').html("Show missing data").addClass('prim').attr('id', index).css('float','right').appendTo(new_div);
       }
     }
   })
   
   function make_base(index, canvas_id)
   {
      var canvas = document.getElementById(canvas_id);
      var context = canvas.getContext('2d');
      var image = new Image();
      image.src = pred_images[index][0];
      image.onload = function(){
         var width = image.width;
         var height = image.height;
         var scale = 1.1;
         canvas.width = Math.floor(width * scale);
         canvas.height = Math.floor(height * scale);   
         context.drawImage(image, 0.05*canvas.width, 0.05*canvas.height);
      }
   }
   
  function reset(index){
     var canvas = document.getElementById("canvas" + index);
     var context = canvas.getContext('2d');
     context.clearRect(0,0,canvas.width, canvas.height);
     points[index] = [];
     make_base(index, "canvas" + index);
  }
   
   function show(index){
    //if(points[index].length > 0)
   // {
      var canvas = document.getElementsByClassName('predict')[index];
      var context = canvas.getContext('2d');
      var image = new Image();
      image.src = pred_images[index][1];
      
      image.onload = function(){
         context.drawImage(image, 0.05*canvas.width, 0.05*canvas.height);
         context.strokeStyle = "red";
         context.lineWidth = canvas.width/200;
         for(var i = 1; i < points[index][0].length; i++)
         {
            context.beginPath();
            context.moveTo(points[index][0][i - 1][0] * canvas.width, points[index][0][i- 1][1] * canvas.height);
            context.lineTo(points[index][0][i][0] * canvas.width, points[index][0][i][1] * canvas.height);
            context.closePath();
            context.stroke();
        }  
      }
    // }
   }
   
   	$(".prim").click(function() {
        var index = $(this).attr('id');
        show(index);
	});
    
    $(".sec").click(function() {
        var index = $(this).attr('id');
        index = index.replace("reset","")*1;
        reset(index);
	});
    
    $(".predict").on('touchstart mousedown', function(event) {
        event.preventDefault();
        var canvas_id = $(this).attr('id');
        var index = canvas_id.replace("canvas","")*1;
        do_mouse_down(event, canvas_id, index);
        });
        
      $(".predict").on('touchmove mousemove',function(event) {
        event.preventDefault();
        var canvas_id = $(this).attr('id');
        var index = canvas_id.replace("canvas","")*1;
        do_mouse_move(event, canvas_id, index);
    });
    
       $(".predict").on('touchend mouseup',function(event) {
        event.preventDefault();
        var canvas_id = $(this).attr('id');
        var index = canvas_id.replace("canvas","")*1;
        do_mouse_up(event, canvas_id, index);
    });
    
    
function do_mouse_down(event, canvas_id, index)
{
  if(draw[index] == 0)
  {
    draw[index] = 1;
    var coords = getCoord(event, canvas_id);
    var canvas = document.getElementById(canvas_id);
    points[index].push([[coords.x / canvas.width, coords.y / canvas.height]]);
  }
}

function do_mouse_move(event, canvas_id, index)
{
  if(draw[index] == 1)
  { 
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    context.strokeStyle = "red";
    context.lineWidth = canvas.width/200;
    context.beginPath();
    var strokes = points[index][points[index].length - 1];
    context.moveTo(strokes[strokes.length - 1][0] * canvas.width, strokes[strokes.length - 1][1] * canvas.height);
    var coords = getCoord(event, canvas_id);
    strokes.push([coords.x / canvas.width, coords.y / canvas.height]);
    context.lineTo(coords.x, coords.y);
    context.closePath();
    context.stroke();
  }
}

function do_mouse_up(event, canvas_id, index)
{
  if(draw[index] == 1)
  {
    draw[index] = 0;
  }
}

function getCoord(event,canvasid){
    var can = document.getElementById(canvasid);
    var tx = event.pageX;
    var ty = event.pageY;
    var touch = event.touches;
    if ( typeof touch !== 'undefined' && touch)
    {
      touch = event.touches[0];
      tx = touch.pageX;
      ty = touch.pageY;
    }
    var top  = window.pageYOffset || document.documentElement.scrollTop,
    left = window.pageXOffset || document.documentElement.scrollLeft;
    //var topy = window.scrollY;
    //var leftx = window.scrollX;
    tx = tx - left;
    ty = ty - top;
    var rect = can.getBoundingClientRect();
    canvas_x = ((tx-rect.left)/(rect.right-rect.left)*can.width);
    canvas_y = ((ty-rect.top)/(rect.bottom-rect.top)*can.height);
    return {x: canvas_x,y: canvas_y};
}

function getCoordNew(event,canvasid){
    var can = document.getElementById(canvasid);
    //var tx = event.clientX;
    //var ty = event.clientY;
    var tx = event.offsetX;
    var ty = event.offsetY;

    var touch = event.originalEvent.touches || event.originalEvent.changedTouches;
    if ( typeof touch !== 'undefined' && touch)
    {
      touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
      tx = touch.pageX - touch.target.offsetLeft;
      ty = touch.pageY - touch.target.offsetTop;
      //tx = touch.clientX;
      //ty = touch.clientY;
    }
    var rect = can.getBoundingClientRect();
    canvas_x = ((tx-rect.left)/(rect.right-rect.left)*can.width);
    canvas_y = ((ty-rect.top)/(rect.bottom-rect.top)*can.height);
    return {x: canvas_x,y: canvas_y};
    //return {x: tx, y: ty}
}

   
   //find input or select to create
   var check = $("p:contains('{input}'),p:contains('{select}')");

   $("p:contains('{input}'),p:contains('{select}')").each(function (index) {
        //check if span being used first
      var element_hide = $(this).find("p:contains('{input}'),p:contains('{select}')");
      if($(this).find("span:contains('{input}'),span:contains('{select}')").length){
          element_hide = $(this).find("span:contains('{input}'),span:contains('{select}')");
      }
      
      var checkText = $(element_hide).html();
      
      var ans_ops = [];
      var all_parts = [];
      
      var parts = checkText.split("{input}");
     
      //check if first part contains select
      var chunk = parts[0];
      var carts = chunk.split("{select}");
      all_parts.push(carts[0]);
      for(var j = 1; j < carts.length; j++)
      {
         all_parts.push("{select}" + carts[j]);
      }
  
        for(var i = 1; i < parts.length; i++)
        {
          var chunk = parts[i];
          var carts = chunk.split("{select}");
          all_parts.push("{input}" + carts[0]);
          for(var j = 1; j < carts.length; j++)
          {
              all_parts.push("{select}" + carts[j]);
          }
        }
      
      
      for(var i = 0; i < all_parts.length; i++)
      {
          var reText = all_parts[i];
          var ans = reText.match("{input}(.*){/input}");
          if(ans == null)
          {
              //check select
              ans = reText.match("{select}(.*){/select}");
              if(ans == null)
              {
                    all_parts[i] = reText;
              }
              else
              {
               //process select
               var new_class = "anscheckdrop";
               var check = ans[1].split(",");
               var ans_show = "";
               var ans_val = check[0];
               if(ans_val.substring(0, 2) == "--"){
                 ans_val = ans_val.substring(2);
                 check[0] = ans_val;
                 ans_show = 1;
               }
               shuffle(check);
    
               ans_ops.push(ans_val);
               var newInput = "<select class='" + new_class + " docactive'>";
               if(ans_show !== 1){
                 newInput = newInput + "<option></option>";
               }
               
               //check all options
               for(var j = 0; j < check.length; j++)
               {
                   var selected = "";
                   if(check[j] == ans_val && ans_show == 1){selected = "selected"}
                   newInput = newInput + "<option " + selected + ">" + check[j] + "</option>";
               }
               newInput = newInput + "</select>";
               reText = reText.replace(ans[0], newInput);
               all_parts[i] = reText;
              }
          
          }
          else
          {
             //process input
             var new_class = "anscheckval";
             var check = ans[1].split("||");
             var check2 = ans[1].split(",");
             var font_size = 12;
             var fixed_size = 10;
             if(check.length == 2){new_class = "anscheckvals";}
             if(check2.length > 1){new_class = "anscheckops";}
             //need to autosize
             var box_width = 10;
             if(new_class == "anscheckval")
             {box_width = ans[1].length*font_size + fixed_size;}
             if(new_class == "anscheckvals")
             {
                //check all options
                for(var j = 0; j < check.length; j++)
                {
                  if(check[j].length*font_size > box_width)
                  {
                  box_width = check[j].length*font_size + fixed_size;
                  }
                }
             }
             if(new_class == "anscheckops")
             {
                for(var j = 0; j < check2.length; j++)
                {
                  if(check2[j].length*font_size > box_width)
                  {
                     box_width = check2[j].length*font_size + fixed_size;
                  }
                }
             }
             
              var ans_show = "";
               var ans_val = ans[1];
       
               if(ans_val.substring(0, 2) == "--"){
                   ans_val = ans_val.substring(2);
                   ans[1] = ans_val;
                           
                   ans_show = 1;
               }
    
              ans_ops.push(ans[1]);
              //need to create an element to append rather than text
              var show_value = "";
              if(ans_show == 1){
                show_value = "value = '" + ans_val + "'";
                
              }
          
            var newInput = "<input type='text' class='" + new_class + " docactive gap' style='width:" + box_width + "px' " + show_value + ">";
            reText = reText.replace(ans[0], newInput);
            all_parts[i] = reText;
          
          }
      }
      
      var merged = all_parts.join("");
      $(element_hide).html(merged);
      $(this).find(".docactive").each(function (index) {
          $(this).data("answer", ans_ops[index]);
      })
          
   })


	  //find MCQ questions to create
	   $("li:contains('{MCQ}')").parent().each(function (index) {
	      $(this).removeClass();
			  $(this).addClass("MCQ");
			  var lis = $(this).find('> li').shuffle();
			  //just shuffle here?
			  //lis = shuffle(lis);
			  for(var i = 0; i < lis.length; i++)
			  {
          var checkText = $(lis[i]).html();
				  var checkJustText =  $(lis[i]).text();
				  var parts = checkText.split("||");
				  var partsText = checkJustText.split("||");
				  var correct = 0;
				  
				  if(parts.length > 1 && partsText[1] == 1)
				  {
					   correct = 1;
				  }
				  $(lis[i]).removeClass();
				  $(lis[i]).data("answer", correct);
				  $(lis[i]).addClass("MCQcheck");
          $(lis[i]).addClass("docactive");
          $(this).addClass("docactive");
				  $(lis[i]).html(parts[0]);
				  if($(lis[i]).text() == "{MCQ}"){$(lis[i]).remove();}
			  }
			  
	  });

    //hide reveal paragraphs
    // grab code from 220 for adding own
    
   $("td:contains('{reveal}')").each(function (index) {
       var checkText = $(this).html().trim();
       var text = checkText.replace("{reveal}","");
       var newInput = "<span class='clickreveal'><span class='click'>Click here to reveal!</span><div class='reveal'>" + text +  "</div></span>";
       $(this).closest('table').replaceWith(newInput);
   });
   $(".reveal").hide();
	  
	    //display embedded iframes
     $("span:contains('</iframe>')").each(function (index) {
        var checkText = $(this).text().trim();
        var ans = checkText.match("<iframe(.*)</iframe>");
        $(this).html(ans[0]);
  });

	  //create events

    	  //trigger revealing answer 
		$(".clickreveal").click(function() {
		$(this).find(".reveal").show();
		$(this).find(".click").hide();
	});

	  $(".anscheck").keyup(function(){
			var ans = $(this).html().trim().toLowerCase();;
			var correct = $(this).data("answer").trim().toLowerCase();;
			if(ans == correct){
			   $(this).addClass("correct");
			   $(this).removeClass("wrong");
			}
			else
			{
			   $(this).addClass("wrong");
			   $(this).removeClass("correct");
			}
	  });

	  $(".anscheckval").keyup(function(){
	  var ans = $(this).val();
	  var correct = $(this).data("answer");

	  var same = 0;
	  if(ans == correct){same = 1;}
	  if(isNaN(ans) && isNaN(correct)){
	  if(ans.toLowerCase() == correct.toLowerCase()){same = 1;}
	  }

	  if(same == 1)
	  {
		 $(this).addClass("correct");
		 $(this).removeClass("wrong");
	  }
	  else
	  {
		$(this).addClass("wrong");
		$(this).removeClass("correct");
	  }
	  });


	 $(".anscheckvals").keyup(function(){
	  var ans = $(this).val();
	  var correct = $(this).data("answer");

	  //check if range given
	  var rangey = correct.split("||");
	  var correct1 = rangey[0]*1;
	  var correct2 = rangey[1]*1;

	  if(ans >= correct1 && ans <= correct2)
	  {
		 $(this).addClass("correct");
		 $(this).removeClass("wrong");
	  }
	  else
	  {
		$(this).addClass("wrong");
		$(this).removeClass("correct");
	  }
	  });

	    $(".anscheckops").keyup(function(){
          var ans = $(this).val().trim().toLowerCase();
          var correct = $(this).data("answer");
          //check if options given
          var rangey = correct.split(",");
          var correct_ans = 0;
          for(var i = 0; i < rangey.length; i++)
          {
              if(rangey[i].trim().toLowerCase() == ans){correct_ans = 1; break;}
          }
          
          if(correct_ans == 1)
          {
              $(this).addClass("correct");
              $(this).removeClass("wrong");
          }
          else
          {
              $(this).addClass("wrong");
              $(this).removeClass("correct");
          }
     });

	//trigger answer checking MCQ
		$(".MCQcheck").click(function() {
		var correct = $(this).data("answer");
		if($(this).hasClass("correct") || $(this).hasClass("wrong") ){
		  //should work out how to negate
		}
		else
		{
		  if(correct == 1){
		   $(this).addClass("correct");
		   $(this).append(" <span class='glyphicon glyphicon-ok' aria-hidden='true'></span>");
		   $(this).removeClass("wrong");
		  }
		  else
		  {
		   $(this).addClass("wrong");
		   $(this).append(" <span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
		   $(this).removeClass("correct");
		  }
		}
	});

    $(".anscheckdrop").change(function(){
	    var ans = $(this).val();
	    var correct = $(this).data("answer");
	    if(ans == correct){
			   $(this).addClass("correct");
			   $(this).removeClass("wrong");
			}
			else
			{
			   $(this).addClass("wrong");
			   $(this).removeClass("correct");
			}
	    
	  })
      
      // show the answers with ctrl q
      document.addEventListener('keydown', function(event) {
         if (event.ctrlKey && event.key === 'q') {
             $("#showAnswers").trigger("click");
            
         }
      });
      
    
    $("#showAnswers").click(function(){
	       // get all the things with class docactive
	       $("span.glyphicon").remove();
           //show all the explanations
           
           $(".clickreveal").each(function (index) {
               $(this).find(".reveal").show();
		       $(this).find(".click").hide();
	       });
           
           
	       $(".docactive").each(function (index) {
	         if($(this).hasClass("MCQcheck"))
	         {
	           if($(this).data("answer") == 1)
	           {
	              $(this).addClass("correct");
		            $(this).append(" <span class='glyphicon glyphicon-ok' aria-hidden='true'></span>");
		            $(this).removeClass("wrong");
	           }
	           else
	           {
	              $(this).addClass("wrong");
		            $(this).append(" <span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
		            $(this).removeClass("correct");
	           }
	         }
          
           if($(this).hasClass("anscheckdrop"))
	         {
	           $(this).removeClass("wrong");
             $(this).addClass("correct");
	           $(this).val($(this).data("answer"));
	         }
	         if($(this).hasClass("anscheck"))
	         {
	           $(this).addClass("correct");
	           $(this).text($(this).data("answer") );
             $(this).removeClass("wrong");
	         }
	         if($(this).hasClass("anscheckval"))
	         {
	           $(this).addClass("correct");
	           $(this).val($(this).data("answer") );
	         var value = $(this).val();
            var size = value.length;
            var font_size = 15;
            var fixed_size = 5;
            box_width = size*font_size + fixed_size;
            $(this).css('width',box_width);
            $(this).removeClass("wrong");
	         }
	         if($(this).hasClass("anscheckvals"))
	         {
	           $(this).addClass("correct");
	           var vals = $(this).data("answer");
	           vals = vals.replace("||"," to ");
	           $(this).val("Answers accepted between " + vals);
	              var value = $(this).val();
            var size = value.length;
            var font_size = 10;
            var fixed_size = 5;
            box_width = size*font_size + fixed_size;
            $(this).css('width',box_width);
            $(this).removeClass("wrong");
	         }
	         if($(this).hasClass("anscheckops"))
	         {
	           $(this).addClass("correct");
	           var vals = $(this).data("answer");
	           vals = vals.split(",").join(" or ");
	           $(this).val(vals);
	              var value = $(this).val();
            var size = value.length;
            var font_size = 10;
            var fixed_size = 5;
            box_width = size*font_size + fixed_size;
            $(this).css('width',box_width);
            $(this).removeClass("wrong");
	         }
	       })
	  });
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

(function($){
 
    $.fn.shuffle = function() {
 
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });
 
        this.each(function(i){
            $(this).replaceWith($(shuffled[i]));
        });
 
        return $(shuffled);
 
    };
 
})(jQuery);