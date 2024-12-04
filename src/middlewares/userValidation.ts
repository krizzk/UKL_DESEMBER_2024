import { NextFunction,Request,Response } from "express";
import Joi from "joi"

const updateDataSchema = Joi.object({
  username: Joi.string().optional(),
  password: Joi.string().min(3).alphanum().optional(),
  role: Joi.string().valid("admin", "user").optional(),
});

const authSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(3).alphanum().required()
})

const addDataUserSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("user").optional(),
  });

  const addDataAdminSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("admin","user").required(),
  });

  export const verifyUpdateUser = (request: Request, response: Response, next: NextFunction) => {
    const {error} = updateDataSchema.validate(request.body,{abortEarly: false})
    
    if (error) {
        
        return response.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join()
        })
    }
    return next()
}

    export const verifyAuthentification = (
    request: Request,
    response:Response,
    next: NextFunction
) =>{
    const {error} = authSchema.validate(request.body,{abortEarly:false})

    if (error){
        return response.status(400).json({
            status:false,
            message: error.details.map((it)=> it.message).join()
        })
    }
    return next();
}

export const verifyAddUser = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { error } = addDataUserSchema.validate(request.body, { abortEarly: false });
    if (error) {
      return response.status(400).json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      });
    }
    return next();
  };

  export const verifyAddAdmin = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const { error } = addDataAdminSchema.validate(request.body, { abortEarly: false });
    if (error) {
      return response.status(400).json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      });
    }
    return next();
  };