<?php 
$p = isset($_GET['p']) ? $_GET['p'] : 1;
$n = $p+1;
$n_max = 1;
$n_per_page = 12;
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

    <div id="page">

        <header>
          <h1>jQuery <em>Fine Box</em></h1>
          <h2>Yet another lightbox plugin</h2>
        </header>
        
        <section id="gallery-wrapper">
        
          <ul class="list clearfix">
            <?php $images = array('portrait1.jpg', 'landscape1.jpg'); ?>
            <?php for ($i=1; $i <= $n_per_page; $i++): ?>
              <?php 
                $image = $images[rand(0, (count($images)-1))];
                $is_first = ($p==1&&$i==1) ? true : false; 
                $rand = rand(23, 7654); 
                $id = $i+$rand; 
                $href = ($rand % 2 == 1) ? 'item.php?image=' . $image . '&amp;id=' . $id : 'images/' . $image . '?id=' . $id;
              ?>
              <li<?php echo $is_first ? ' class="first"' : '' ?>>
                <div class="item-container">
                  <a href="<?php echo $href ?>" class="finebox"><span><img alt="sample" src="images/thumb-<?php print $image; ?>" /></span></a>
                </div>
              </li>
            <?php endfor; ?>
          </ul>
        
          <div class="pagination">
            <p class="pages">
              <?php if ($p > 1 ): ?>
              <a href="index.php" class="first"><span>&laquo;</span></a>
              <a href="index.php?p=<?php echo $p-1 ?>" class="previous"><span>&lt;</span></a>
              <?php endif; ?>
              <?php for ($i=1; $i <= $n_max; $i++): ?>
                <?php if ($p==$i): ?>
                  <b class="ui-state-hover- ui-corner-all"><?php echo $i ?></b>
                <?php else: ?>
                  <a href="index.php?p=<?php echo $i ?>" class="item"><span><?php echo $i ?></span></a>
                <?php endif; ?>
              <?php endfor; ?>
              <?php if ($p < 4 ): ?>
              <a href="index.php?p=<?php echo $n ?>" class="next"><span>&gt;</span></a>
              <a href="index.php?p=<?php echo $n_max ?>" class="last"><span>&raquo;</span></a>
              <?php endif; ?>
            </p>
            <p class="range"><?php echo ($p*$n_per_page)-($n_per_page-1) ?> to <?php echo $p*$n_per_page ?> of <?php echo $n_max*$n_per_page ?> results</p>
          </div>
        
        </section> 
   
    </div>
    
    <div id="footer">
      © <?php echo date('Y'); ?> Pixopat
    </div>

    <script src="https://www.google.com/jsapi?key=ABQIAAAAONkVRKMQvuOP9-YeS_wzXBRl9GfAaYyxcsH2lXPiiiSncCmD5hShYpzx4OuXcGRisuqfVOB7BfmVRA"></script>
    <script>
    var google = google || null;
      if (google) {
        google.load("jquery", "1", { uncompressed: true });
        google.load("jqueryui", "1");
        google.load("webfont", "1");
      }
    </script>
    <script>!window.jQuery && document.write('<script src="js/jquery-1.5.1.js"><\/script>')</script>
    <script src="js/jquery.depagify.min.js"></script>
    <script src="js/jquery.finebox-0.5.min.js"></script>
    <script src="js/init.js"></script>

  </body>
</html>