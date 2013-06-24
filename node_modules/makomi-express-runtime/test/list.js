var mkRun = require('../index.js');

var layout = {
  source: "layouts/default",
  context: {
    "title": "I am a list"
  },
  templates: {
    "body": {
      source: "basic/list",
      context: {
        "myList": [
          {name:"Thing1","value":10},
          {name:"Thing2","value":20},
          {name:"Thing3","value":30}
        ]
      }
    }
  }
}

mkRun.compile(layout,function(renderedView) {
  console.log("View rendered:")
  console.log(renderedView)
})