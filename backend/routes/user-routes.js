const express=require("express")

const usersController=require("../controller/users-controller")

const router=express.Router();

router.post("/signin",usersController.signin);
router.post("/signup",usersController.signup);

module.exports=router;