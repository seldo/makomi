var mkRun = require('../index.js');

var layout = {
  source: "layouts/default",
  context: {
    "title": "I am the page"
  },
  templates: {
    "body": {
      source: "basic/page",
      context: {
        "foo": "bar"
      }
    }
  }
}

mkRun.compile(layout,function(renderedView) {
  console.log("View rendered:")
  console.log(renderedView)
})