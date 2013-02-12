<?php
 $img_src = $_GET['image'];
 $video_src = $_GET['video'];
?>
<!DOCTYPE HTML>
<html>
  <head>
    <script src="js/finebox-permalink.js"></script>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>jQuery Fine Box</title>
    <link href="http://fonts.googleapis.com/css?family=Merriweather:300,regular,700,900" rel="stylesheet" type="text/css" >
    <link href="http://fonts.googleapis.com/css?family=Pacifico:regular" rel="stylesheet" type="text/css" >
    <link rel="stylesheet" href="css/finebox.css" type="text/css">
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/themes/base/jquery-ui.css" type="text/css">
  </head>

  <body>
    <header>
    <h1>jQuery <em>Fine Box</em></h1>
    <h2>Yet another lightbox plugin</h2>
    </header>
    <section>

        
        <div id="gallery-item-wrapper">              

        	<div class="photo">
        		<img src="images/<?php echo $img_src; ?>" alt="" />
        	</div>

        	<div class="datas">
        		<div class="description">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium&hellip;</div>
        	</div>
     
        </div><!-- end gallery-item-wrapper -->
        
        <div class="sample clearfix">
          SAMPLE CONTENT
        </div>

    </section>    
    <script src="https://www.google.com/jsapi?key=ABQIAAAAONkVRKMQvuOP9-YeS_wzXBRl9GfAaYyxcsH2lXPiiiSncCmD5hShYpzx4OuXcGRisuqfVOB7BfmVRA"></script>
    <script>
      google.load("jquery", "1.6.1", {uncompressed:true});
      google.load("jqueryui", "1.8.13");
      google.load("webfont", "1.0.19");
    </script>
    <script>!window.jQuery && document.write('<script src="js/jquery-1.5.1.js"><\/script>')</script>
    <script src="js/jquery.finebox-0.5.min.js"></script>
    <script src="js/init.js"></script>

  </body>
</html>