module.exports = function(app){

  var index = require('./controllers/index')
    , context = require('./controllers/context')
    , output = require('./controllers/output')
    , toolbox = require('./controllers/toolbox')

    app.get('/sessionwrite',function(req, res){

        var sessionData = {
            "key1": "val" + Math.random(),
            "key2": "val2"
        }

        req.session.set('testkey',sessionData,function(){
            res.render('sessionwrite',{'sessiondata':sessionData});
        });
    });

    app.get('/sessionread',function(req, res){
        req.session.get('testkey',function(er,sessionData){
            res.render('sessionread',{'sessiondata':sessionData});
        });
    });

  app.get('/:project', index.index);
  app.get('/:project/context', context.dom);
  app.get('/:project/output',  output.base);
  app.get('/:project/toolbox', toolbox.base);

}