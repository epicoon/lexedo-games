#lx:use lx.Color;
#lx:use lx.Form;
#lx:use lx.socket.WebSocketClient;

#lx:namespace lexedo.games.manage;
class Core {
	constructor(plugin) {
		this.plugin = plugin;
		this.processChecker = new lexedo.games.manage.ProcessChecker(this);
		this.socket = null;

		this.processInfo = new lexedo.games.manage.ProcessInfo();
		this.channelInfo = new lexedo.games.manage.ChannelInfo();

		this.channels = lx.ModelCollection.create({
			schema: {
				type: {},
				icon: {},
				name: {},
				selected: {default: false}
			}
		});

		this.connections = lx.ModelCollection.create({
			schema: [
				'key',
				'type', // gamer, observer
				'userId',
				'userAuthValue',
				'date'
			]
		});

		this.boxes = null;
		__initGui(this);
	}

	run() {
		this.processChecker.start();
	}

	refresh(data) {
        this.processInfo.set(data.process);
        if (this.processInfo.isActive()) {
			this.socket = new lexedo.games.manage.WebSocketClient(this, data.connectionData);
			this.socket.connect({login: lx.app.user.login}, {
				auth: lx.app.storage.get('lxauthtoken'),
				cookie: document.cookie
			});
        }
	}
}

function __initGui(self) {
	let color = new lx.Color('lightgreen'),
	    channelColor = color.clone().lighten(15);
    self.plugin.root.begin();
	self.boxes = __render(color, channelColor);
    self.plugin.root.end();

	self.boxes.channelsList.matrix({
	    items: self.channels,
	    itemBox: [lx.Box, {grid:{indent:'10px'}}],
	    itemRender: function(box, model) {
	        box.setField('selected', function(val) {
	            this.fill(val ? channelColor : '');
	        });
	        var icon = new lx.Box();
	        icon.border({color:'lightgray'});
	        icon.align(lx.CENTER, lx.MIDDLE);
	        icon.setField('icon', function(val) {
	            if (!val) return;
	            this.clear();
	            var img = this.add(lx.Image, {filename: val});
	            img.adapt();
	        });

	        (new lx.Box({
	            field: 'name',
	            width: 11,
	            css: 'lga-Box'
	        })).align(lx.CENTER, lx.MIDDLE);
	    }
	});

	self.boxes.processBox.bind(self.processInfo);
	self.boxes.channelInfoBox.bind(self.channelInfo);


	self.boxes.connectionsList.matrix({
	    items: self.connections,
	    itemBox: [lx.Form, {grid:{indent:'10px', cols:20}}],
	    itemRender: function(form, model) {
	        form.fields({
	            userId: lx.Box,
	            userAuthValue: [lx.Box, {width:5}],
	            key: [lx.Box, {width:8}],
	            type: [lx.Box, {width:3}],
	            date: [lx.Box, {width:3}],
	        });
	        form.getChildren().forEach(c=>c.addClass('lga-Box').align(lx.CENTER, lx.MIDDLE));
	    }
	});
}

#lx:tpl-function __render(color, channelColor) {
	<lx.Box:@main._spread>
		.gridProportional()
		<lx.Box:@processBox (geom:[0, 0, 12, 2])>.fill(color)
			.gridProportional(indent:'10px', cols:13)
			<lx.Box:.lga-Box (width:3)>
				<lx.Box:@processLabel._spread (text:'lexedo/games - games_server')>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box:@processRefreshIndicator (geom: ['5px', '5px', '5px', '5px'])>
			<lx.Box:[f]status.lga-Box (width:2)>.align(lx.CENTER, lx.MIDDLE)
			<lx.Box:[f]pid.lga-Box (width:2)>.align(lx.CENTER, lx.MIDDLE)
			<lx.Box:[f]date.lga-Box (width:2)>.align(lx.CENTER, lx.MIDDLE)
			<lx.Button:@processErrors (text:'errors')>
			<lx.Button:@processLog (text:'log')>
			<lx.Button:@processRestart (text:'restart')>
			<lx.Button:@processStor (text:'stop')>
		<lx.Box (geom:[0, 2, 4, 1], text:'Channels')>.align(lx.CENTER, lx.MIDDLE).fill(color)
		<lx.Box (geom:[4, 2, 8, 1], text:'Channel info')>.align(lx.CENTER, lx.MIDDLE).fill(color)
		<lx.Box (geom:[0, 3, 4, 25])>
			<lx.Box:@channelsList._spread>.stream()
		<lx.Box:@channelInfoBox (geom:[4, 3, 8, 25])>.fill(channelColor)
			.gridProportional(indent:'10px')
			<lx.Box:.lga-Box (geom:[0, 0, 2, 3])>.align(lx.CENTER, lx.MIDDLE)
			<lx.Box:.lga-Box (geom:[2, 0, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box (size:['auto','auto'], text:'Type: ')>
				<lx.Box:[f]type (size:['auto','auto'])>
			<lx.Box:.lga-Box (geom:[2, 1, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box (size:['auto','auto'], text:'Name: ')>
				<lx.Box:[f]name (size:['auto','auto'])>
			<lx.Box:.lga-Box (geom:[2, 2, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box (size:['auto','auto'], text:'Key: ')>
				<lx.Box:[f]key (size:['auto','auto'])>
			<lx.Box:.lga-Box (geom:[7, 0, 5, 1])>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box (size:['auto','auto'], text:'Date: ')>
				<lx.Box:[f]date (size:['auto','auto'])>
			<lx.Box:.lga-Box (geom:[0, 3, 12, 9])>
				<lx.Box (geom:[0,0,100,'60px'])>
					.grid(indent:'10px',cols:20)
					<lx.Box (text:'id')>.align(lx.CENTER, lx.MIDDLE)
					<lx.Box (text:'auth value', width:5)>.align(lx.CENTER, lx.MIDDLE)
					<lx.Box (text:'connection key', width:8)>.align(lx.CENTER, lx.MIDDLE)
					<lx.Box (text:'type', width:3)>.align(lx.CENTER, lx.MIDDLE)
					<lx.Box (text:'date', width:3)>.align(lx.CENTER, lx.MIDDLE)
				<lx.Box:@connectionsList (top:'60px')>.stream()
}
