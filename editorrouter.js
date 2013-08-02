module.exports = function(req,res,next) {
  console.log("I'M ROUTING BITCH")
  // modify req to point to correct location based on project
  next()
}