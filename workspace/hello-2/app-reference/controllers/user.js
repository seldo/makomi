
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.render('users/list', { title: 'A list of users' });
};