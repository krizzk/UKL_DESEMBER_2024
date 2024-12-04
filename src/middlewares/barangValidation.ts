import { NextFunction,Request,Response } from "express";
import Joi from "joi"

const addDataSchema = Joi.object({
    nama: Joi.string().required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    user: Joi.optional(),
  });

  export const verifyAddBarang = (request: Request, response: Response, next: NextFunction) => {
    const {error} = addDataSchema.validate(request.body,{abortEarly: false})
    
    if (error) {
        
        return response.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join()
        })
    }
    return next()
}

const updateDataSchema = Joi.object({
    nama: Joi.string().optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    quantity: Joi.number().optional(),
    user: Joi.optional(),
  });

  export const verifyUpdateBarang = (request: Request, response: Response, next: NextFunction) => {
    const {error} = updateDataSchema.validate(request.body,{abortEarly: false})
    
    if (error) {
        
        return response.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join()
        })
    }
    return next()
}

// PEMINJAMAN DAN PENGEMBALIAN BARANG
const borrowSchema = Joi.object({
    id_user: Joi.number().required(),
    id_barang: Joi.number().required(),
    borrow_date: Joi.date().iso().required(),
    return_date: Joi.date().iso().greater(Joi.ref('borrow_date')).required(),
    user: Joi.optional(),
});

export const validateBorrow = (req: Request, res: Response, next: NextFunction) => {
    const { error } = borrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};

const returnSchema = Joi.object({
    borrow_id: Joi.number().required(), //integer
    return_date: Joi.date().iso().required(),
    status: Joi.string().valid("kembali","hilang").required(),
    user: Joi.optional(),
});

export const validateReturn = (req: Request, res: Response, next: NextFunction) => {
    const { error } = returnSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};


const analisisSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
    group_by: Joi.string().valid("category","location").required(),
    user: Joi.optional(),
});

export const validateAnalis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analisisSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};

const analisisBorrowSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
    user: Joi.optional(),
});

export const validateBorrowAnalis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analisisBorrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};
