var React = require("react");
var fuz = require("fuzzy");
var $ = require("jquery");

var hoverDirectionEnum = {
	up: "UP",
	down: "DOWN"
};

var getNewHoverElement = function(dir, list, i, $) {
	var toReturn;
	if(dir === hoverDirectionEnum.up){
		toReturn = $(list[(i - 1)]);
		return toReturn.length > 0 ? toReturn : $(list[list.length - 1]);
	}
	toReturn = $(list[(i + 1)]);
	return toReturn.length > 0 ? toReturn : $(list[0]);
}

var adjustHover = function($list, which, $){
	var direction;
	var $hover = $list.find("li.hover");
	var $lis = $list.find("li");
	var $newHover;
	var hoverClass = "hover";

	if(which === 38){
		direction =  hoverDirectionEnum.up;
	} else if(which === 40) {
		direction = hoverDirectionEnum.down;
	}
	//get the item before the hover
	if($hover.length > 0){
		$lis.each((i, ele) => {
			var $ele = $(ele);
			if($ele.hasClass(hoverClass)){
				$newHover = getNewHoverElement(direction, $lis, i, $);
				if($newHover !== undefined){
					$newHover.addClass(hoverClass);
					$hover.removeClass(hoverClass);
					return false;
				} else {
					if(!$lis.first().hasClass(hoverClass)){
						$lis.first().addClass(hoverClass);
						$hover.removeClass(hoverClass);
						return false;
					}
				}
			}
		});
	} else {
		$lis.first().addClass(hoverClass);
	}

	$hover.removeClass(hoverClass);
}

var arrowKeys ={
	"38" : ($list, which, $) => {
		// up
		adjustHover($list, which, $);
	},
	"40": ($list, which, $) => {
		// down
		adjustHover($list, which, $);

	},
	"27": ($list, which, $, component) => {
		// esc
		component.hideList();
	},
	"9": () => {
		// tab
		arrowKeys["13"].apply(this, arguments);
	},
	"13": ($list, which, $, component, e) => {
		var $hovers = $list.find("li.hover");
		var value = $hovers.first().text().length > 0 ?
			$hovers.first().text() :
			$list.find("li").first().text()

		component.setState({
			value: value,
			showList: false
		});

		$hovers.removeClass("hover");
		e.preventDefault();
	}
}
var oldHover;
module.exports = React.createClass({
	getInitialState(){
		return {
			value: this.props.value || "",
			matches: [],
			showList: false
		};
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({
			value : nextProps.value
		})
	},
	setValueFromLi(e) {
		$(this.refs.list.getDOMNode()).find("li.hover").removeClass("hover");
		this.setState({
			value: e.target.innerText,
			showList: false
		});
	},
	setValue(e) {
		this.setState({
			value: this.refs.input.getDOMNode().value || ""
		});
		this.fuzzySearch(this.refs.input.getDOMNode().value);
		this.props.afterChange && this.props.afterChange(e);
	},
	fuzzySearch(value){
		var _this = this;
		if(this.props.values.then){
			this.props.values.then((response) => {
				search(response);
			})
		} else {
			search(this.props.values);
		}
		function search(values) {
			var matches = fuz.filter((value || ""), (values || [])).map(x => x.string);
			_this.setState({
				matches: matches,
				showList: matches.length > 0
			});
		}
	},
	handleKeyDown(e) {
		var which = e.which || e.eventCode;
		if(arrowKeys[which] && this.state.showList){
			arrowKeys[which]($(this.refs.list.getDOMNode()), which , $, this, e);
		}
	},
	toggleList() {
		this.setState({
			showList: this.state.matches.length > 0
		});
	},
	hideList() {
		var hoveredLis = $("li:hover");
		var value = hoveredLis.length > 0 ? hoveredLis.first().text() : this.state.value
		this.setState({
			showList: false,
			value: value
		});
		var fakeE = {
			target: {
				id: this.refs.input.getDOMNode().id,
				value: value
			}
		}
		this.props.afterChange && this.props.afterChange(fakeE);
	},
	renderListChildren(listItem, i) {
		if(i > (this.props.maxNumberOfResults || 7)){
			return ""
		}
		var style = {
			width: $(this.refs.input.getDOMNode()).width() + 33
		}
		return (
			<li style={style} onClick={this.setValueFromLi} className="list-group-item list-group-item-typeahead" key={i}>
				{listItem}
			</li>
		)
	},
	renderList(list) {
		return (
			<ul onMouseOver={this.removeHover} onMouseOut={this.addHoverBack} ref="list" className="list-group list-group-typeahead">
				{list.map(this.renderListChildren)}
			</ul>
		)
	},
	addHoverBack() {
		oldHover.addClass("hover");
	},
	removeHover() {
		oldHover = $(this.refs.list.getDOMNode()).find("li.hover");
		oldHover.removeClass("hover");
	},
	render() {
		return (
			<div>
				<input className="form-control input-lg"
				ref="input" value={this.state.value || ""}
				onChange={this.setValue}
				onKeyDown={this.handleKeyDown}
				onBlur={this.hideList}
				id={this.props.id}
				disabled={this.props.disabled}/>
				<div className={ this.state.showList ? "" : "hide"}>
					{
						this.renderList(this.state.matches)
					}
				</div>
			</div>

		);
	}
});
