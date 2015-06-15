# react-autocomplete
React auto complete 

#Is this ready for production
No. It's still has hardcoded dependencies. But it's not far off. 

#Usage
```javascript
<TypeaheadInput id="class" afterChange={this.handleChange} values={this.asyncValues("jobs/players/class.json")} value={this.state.player.class}

```
##values
Can be a promise or an array. A promise is dictated by having a `then` method hanging off of it.
