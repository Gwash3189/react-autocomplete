# react-autocomplete
React auto complete 

#Is this ready for production
No. It's still has hardcoded dependencies. But it's not far off. 

#Usage
```javascript
<TypeaheadInput afterChange={this.handleChange} values={this.asyncValues("someEndPointOrJsonFile")} value={defaultValue}

```
##values
Can be a promise or an array. A promise is dictated by having a `then` method hanging off of it.
