if(window.localStorage.todos){
	todos = JSON.parse(window.localStorage.todos);
}else{
	var todos = [
			{text: "Do this", done: true, important: false},
			{text: "Do that", done: false, important: false},
			{text: "What to do?", done: false, important: false},
			{text: "Make a todo list", done: false, important: false},
			{text: "Write all the stuff you want to do", done: false, important: false}
	];
	window.localStorage.todos = JSON.stringify(todos);
}



var Todo = Backbone.Model.extend({
	text: 'TODO',
	done: false,
	important: false
});
var List = Backbone.Collection.extend({
	model: Todo
});
var TodoView = Backbone.View.extend({
	defaults:{
		text: '',
		done: false,
		important: false
	},
	className: 'todo',
	tagName: 'article',
	events: {
		"click .delete-link": "delete",
		"click .important": "important",
		"keyup input[type='text']": "edit",
		"click input[type='checkbox']": "check"
	},
	render: function(){
		var templ = _.template($('#todo-template').html());
		this.$el.html(templ(this.model.toJSON()));
	},
	delete: function(e){
		e.preventDefault();
		var that = this;
		this.$el.fadeOut(function(){
			that.model.destroy();
			todo.saveLocal();
			todo.render();
		});
	},
	important: function(e){
		e.preventDefault();
		this.model.attributes.important = ! this.model.attributes.important;
		todo.render();
	},
	edit: function(e){
		this.model.attributes.text = e.target.value;
		todo.saveLocal();
	},
	check: function(e){
		this.model.attributes.done = e.target.checked;
		todo.saveLocal();
	}
});
var TodosView = Backbone.View.extend({
	el: $('#wrapper'),
	activeTab: 'all',
	events:{
		"click #nav a, #search": "search",
		"keyup #search": "search",
		"submit form.new": "create"
	},
	initialize: function(){
		this.collection = new List(todos);
		this.render();
	},
	
	render: function(searchStr){
		this.$el.find('article').remove();
		var tab = this.activeTab;
		var searchStr = searchStr || '';
		_.each(this.collection.models, function(item){
			var todoView = new TodoView({
				model: item
			});
			var renderView = function(){
				todoView.render();
				$('#todos').append(todoView.el);
			}
			if(searchStr == '' || item.attributes.text.toLowerCase().indexOf(searchStr.toLowerCase()) != -1 ){
				if(tab == 'all'){
					renderView();
					return;
				}
				if(tab == 'done' && item.attributes.done){
					renderView();
					return;
				}
				if(tab == 'undone' && !item.attributes.done){
					renderView();
					return;
				}
				if(tab == 'important' && item.attributes.important){
					renderView();
					return;
				}
			}
		});
		this.saveLocal();
	},
	search: function(e){
		var searchStr = $('input[type="search"]').val();
		if($(e.target).is($('a'))){
			e.preventDefault();
			var tab = e.target.id;
			this.activeTab = tab;
			$('nav a').removeClass('active');
			$(e.target).addClass('active');
		}
		this.render(searchStr);
		
	},
	create: function(e){
		e.preventDefault();
		this.collection.add(new Todo({
			text: $('#new').val(),
			done: false,
			important: false
		}))
		this.render();
		$('#new').val('');
		$('nav a').removeClass('active');
		$('#show-all').addClass('active');
		this.saveLocal();
	},
	saveLocal: function(){
		window.localStorage.todos = JSON.stringify(this.collection.models);
	}
});


var todo = new TodosView();