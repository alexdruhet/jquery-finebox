<?php 
$p = isset($_GET['p']) ? $_GET['p'] : 1;
$n_max = 1;
$n_per_page = 12;
$items = array('portrait1.jpg', 'landscape1.jpg', 'cc4a323717es', '23e33e28236s', 'item.php?image=portrait1', 'item.php?image=landscape1', 'ny-taxi-iPhone.m4v', 'ny-taxi.m4v');
$player_key = '2dc869296ecb';
?>

<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>jQuery Fine Box</title>
    <link href="http://fonts.googleapis.com/css?family=Merriweather:300,regular,700,900" rel="stylesheet" type="text/css" >
    <link href="http://fonts.googleapis.com/css?family=Pacifico:regular" rel="stylesheet" type="text/css" >
    <link rel="stylesheet" href="css/finebox.css" type="text/css">
    <!-- <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/themes/base/jquery-ui.css" type="text/css"> -->
  </head>

  <body>

    <div id="page">

        <header>
          <h1>jQuery <em>Fine Box</em></h1>
          <h2>Yet another lightbox plugin</h2>
        </header>
        
        <section id="gallery-wrapper">
        
          <ul class="list clearfix">
            <?php for ($i=1; $i <= $n_per_page; $i++): ?>
              <?php 
                $item = $items[rand(0, (count($items)-1))];
                $is_first = ($p == 1 && $i == 1) ? true : false; 
                $rand = rand(23, 7654); 
                $id = $i + $rand; 
                $html = '';
                $fragment_src = '';
                $fragment = '';
                if (preg_match('/(\.html|\.php)/', $item)) {
                    // echo '<strong>HTML ('. $item .')</strong>';
                    $html = '<a href="' . $item . '" class="finebox"><span>' . $item.'</span></a>';
                }
                else if (preg_match('/(\.jpg|\.gif|\.png)/', $item)) {
                    // echo '<strong>IMAGE ('. $item .')</strong>';
                    $href = ($rand % 2 == 1) ? 'item.php?image=' . $item . '&amp;id=' . $id : 'images/' . $item . '?id=' . $id;
                    if ($rand % 2 == 1) {
                        $fragment_src = ' data-fragment-src="#finebox-data-' . $id . '"';
                        $fragment = '<div class="finebox-data" id="finebox-data-' . $id . '">'
                                   .'<h2>' . $item . '</h2>'
                                   .'</div>';
                    }
                    $html = '<a href="' . $href . '" class="finebox"' . $fragment_src . '><span><img alt="sample" src="images/thumb-' . $item . '" /></span></a>'
                           .$fragment;
                }
                else if (preg_match('/(\.m4v|\.mov)/', $item)) {
                    // echo '<strong>VIDEO ('. $item .')</strong>';
                    $href = ($rand % 2 == 1) ? 'item.php?video=' . $item . '&amp;id=' . $id : 'videos/' . $item . '?id=' . $id;
                    $base_name = preg_replace('/(\.m4v|\.mov)/', '', $item);
                    $html = '<a href="' . $href . '" class="finebox"><span><img alt="sample" src="videos/' . $base_name . '-poster.jpg" /></span></a>';
                }
                else {
                    // echo '<strong>VIDEOS ('. $item .')</strong>';
                    $html = '<div id="video-' . $item . '" data-playerkey="' . $player_key . '" data-sig="' . $item . '" class="finebox"><img src="http://api.kewego.com/video/getThumbnail/?playerKey=' . $player_key . '&amp;sig=' . $item . '&amp;size=normal" /></div>';
                }
              ?>
              <li<?php echo $is_first ? ' class="first"' : '' ?>>
                <div class="item-container">
                  <?php echo $html; ?>
                </div>
              </li>
            <?php endfor; ?>
          </ul>
        
        </section> 
   
    </div>
    
    <footer>
      © <?php echo date('Y'); ?> Pixopat
    </footer>

    <script src="https://www.google.com/jsapi?key=ABQIAAAAONkVRKMQvuOP9-YeS_wzXBRl9GfAaYyxcsH2lXPiiiSncCmD5hShYpzx4OuXcGRisuqfVOB7BfmVRA"></script>
    <script>
    var google = google || null;
      if (google) {
        google.load("jquery", "1", { uncompressed: true });
        // google.load("jqueryui", "1");
        google.load("webfont", "1");
      }
    </script>
    <script>!window.jQuery && document.write('<script src="js/jquery-1.9.0.js"><\/script>')</script>
    <script src="js/jquery.depagify.min.js"></script>
    <script src="js/jquery.finebox.lite-1.0.js"></script>
    <script src="js/init-lite.js"></script>

  </body>
</html>