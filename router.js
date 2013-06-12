module.exports = function(app){

  var routes = require('./routes')
    , context = require('./routes/context')
    , output = require('./routes/output')
    , toolbox = require('./routes/toolbox')

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

  app.get('/:project', routes.index);
  app.get('/:project/context', context.dom);
  app.get('/:project/output',  output.base);
  app.get('/:project/toolbox', toolbox.base);

}