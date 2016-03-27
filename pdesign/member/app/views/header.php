<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="csrf-token" content="<?php echo csrf_token() ?>">
	<meta name="referrer" content="never">
	<link href="<?php echo asset_url('img/favicon.png') ?>" rel="icon">

	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,300,300italic,400italic,600italic,700,700italic' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">

	<link href="../css/bootstrap.min.css" rel="stylesheet">
	<link href="../css/main.css" rel="stylesheet">

	<script src="../js/jquery-2.1.4.min.js"></script>
	<script src="../js/bootstrap.min.js"></script>

	<title><?php echo (isset($pageTitle) ? $pageTitle .' | ' : '') . Config::get('app.name') ?></title>

	<link href="<?php echo asset_url('css/main.css') ?>" rel="stylesheet">

	<?php $color = Config::get('app.color_scheme'); ?>

	<script src="<?php echo asset_url('js/easylogin.js') ?>"></script>
	<script src="<?php echo asset_url('js/main.js') ?>"></script>
	<script>
		EasyLogin.options = {
			ajaxUrl: '<?php echo App::url("ajax.php") ?>',
			lang: <?php echo json_encode(trans('main.js')) ?>,
			debug: <?php echo Config::get('app.debug')?1:0 ?>,
		};
	</script>
</head>
<body>


	<div style="height:50px; margin-bottom:10px;  background-color:#F9F9F9; font-size:18px; padding-left:10px; padding-top:8px; display:flex; width:100%; position:relative;   box-shadow: 0 0 5px rgba(57,70,78,.3); z-index:100;">
		<div style=" margin-right:5px; height:40px; width:40px;" id="applogo">
			<img src="../17602239_s.jpg" style="height:40px; float:left;">
		</div>

			<div class="logo-font">
				<a href='/Gopher-v0.2/pdesign/'>Elo Parametric Design</a>
			</div>

			<div style="margin-right:10px; margin-top:2px;  flex: 3 0 0; text-align:right">
			</div>

			<div style="margin-right:20px;  text-align:right">
				<button class="btn btn-default" id="NewProject"><i class="fa fa-file-o"></i> New</button>

				<?php if (Auth::check()): ?>
						<?php if (Auth::userCan('dashboard')): ?>

								<a href="admin.php" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="<?php _e('main.admin_dashboard'); ?>">
									<span class="glyphicon glyphicon-cog"></span>
								</a>
						<?php endif ?>
						<div class="btn-group dropdown">
							<button class="btn btn-default" id="UserDetails" data-toggle="dropdown" data-hover="dropdown"><img src="<?php echo Auth::user()->avatar ?>" class="avatar"> </a> <?php echo Auth::user()->display_name ?> <b class="caret"></b></button>
							<ul class="dropdown-menu dropdown-menu-right">
								<li><a href="profile.php?u=<?php echo Auth::user()->id ?>"><?php _e('main.my_profile'); ?></a></li>
								<li><a href="settings.php"><?php _e('main.settings'); ?></a></li>
								<li><a href="logout.php"><?php _e('main.logout'); ?></a></li>
							</ul>
						</div>
				<?php else: ?>
					<a href='../member/' class="btn btn-default" data-toggle="modal" id="ForkButton"><i class="fa fa-sign-in"></i> Sign in</a>
				<?php endif; ?>


			</div>
	</div>



    <div class="container">
    	<div class="main">
