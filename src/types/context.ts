import {
  arg,
  booleanArg,
  floatArg,
  inputObjectType,
  list,
  nonNull,
  objectType,
  stringArg,
  subscriptionType,
} from 'nexus'
import { Context } from '../context'
import _ from 'lodash'

export const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allCategories', {
      type: 'Category',
      args: {
        isDeleted: booleanArg(),
      },
      resolve: (_parent, args: any, context: Context) => {
        let updateValue: any = {}
        Object.keys(args).forEach((field) => {
          if (args[field]) {
            updateValue[field] = args[field]
          }
        })
        return context.prisma.category.findMany({
          where: updateValue,
        })
      },
    })

    t.nonNull.list.nonNull.field('allSubCategories', {
      type: 'SubCategory',
      args: {
        isDeleted: booleanArg(),
        categoryId: stringArg(),
      },
      resolve: (_parent, args: any, context: Context) => {
        let updateValue: any = {}
        Object.keys(args).forEach((field) => {
          if (args[field]) {
            updateValue[field] = args[field]
          }
        })
        return context.prisma.subCategory.findMany({
          where: updateValue,
        })
      },
    })

    t.nonNull.list.nonNull.field('allExpenses', {
      type: 'Expense',
      args: {
        isLoan: booleanArg(),
        subCategoryId: stringArg(),
      },
      resolve: (_parent, args: any, context: Context) => {
        let updateValue: any = {}
        Object.keys(args).forEach((field) => {
          if (args[field]) {
            updateValue[field] = args[field]
          }
        })
        return context.prisma.expense.findMany({
          where: updateValue,
        })
      },
    })

    t.nonNull.field('expenseById', {
      type: 'Expense',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.expense.findUniqueOrThrow({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.list.nonNull.field('allLoanAmounts', {
      type: 'Loan',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.loan.findMany({})
      },
    })

    t.list.nonNull.field('allUnitTypes', {
      type: 'UnitTypes',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.unitTypes.findMany({})
      },
    })

    t.list.nonNull.field('allLabourWorks', {
      type: 'LabourWork',
      args: {
        startDate:arg({type:'Date'}),
        endDate: arg({type:'Date'})
      },
    
      resolve: (_parent, args, context: Context) => {
        let workedOn :any = {};
        if(args.startDate){
          workedOn['gte'] = args.startDate
        }
        if(args.endDate){
          workedOn['lte'] = args.endDate
        }

        return context.prisma.labourWork.findMany({
          where: _.isEmpty(workedOn) ? {} : {workedOn }
        })
      },
    })

    t.list.nonNull.field('allLabourTypes', {
      type: 'LabourTypes',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.labourTypes.findMany({})
      },
    })
  },
})

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('createCategory', {
      type: 'Category',
      args: {
        name: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.category.create({
          data: {
            name: args.name,
          },
        })
      },
    })

    t.field('updateCategory', {
      type: 'Category',
      args: {
        id: nonNull(stringArg()),
        name: stringArg(),
        isActive: booleanArg(),
        isDeleted: booleanArg(),
      },
      resolve: (_, args, context: Context) => {
        let { id, ...data } = args as any
        let updateValue: any = {}
        Object.keys(data).forEach((field) => {
          if (data[field] !== undefined || data[field] !== null) {
            updateValue[field] = data[field]
          }
        })
        return context.prisma.category.update({
          data: updateValue,
          where: {
            id: id,
          },
        })
      },
    })

    t.field('deleteCategory', {
      type: 'Category',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.category.delete({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.field('updateSubCategory', {
      type: 'SubCategory',
      args: {
        id: nonNull(stringArg()),
        name: stringArg(),
        isActive: booleanArg(),
        isDeleted: booleanArg(),
      },
      resolve: (_, args, context: Context) => {
        let { id, ...data } = args as any
        let updateValue: any = {}
        Object.keys(data).forEach((field) => {
          if (data[field] !== undefined || data[field] !== null) {
            updateValue[field] = data[field]
          }
        })
        return context.prisma.subCategory.update({
          data: updateValue,
          where: {
            id: id,
          },
        })
      },
    })

    t.field('createSubCategory', {
      type: 'SubCategory',
      args: {
        name: nonNull(stringArg()),
        categoryId: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.subCategory.create({
          data: {
            name: args.name,
            categoryId: args.categoryId,
          },
        })
      },
    })

    t.field('deleteSubCategory', {
      type: 'SubCategory',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.subCategory.delete({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.field('createExpense', {
      type: 'Expense',
      args: {
        data: nonNull(
          arg({
            type: 'ExpenseCreateInput',
          }),
        ),
      },
      resolve: async (_, args, context: Context) => {
        const newExpense = await context.prisma.expense.create({
          data: {
            amount: args.data.amount,
            purchaseDate: args.data.purchaseDate,
            subCategoryId: args.data.subCategoryId,
            isLoan: args.data.isLoan,
            comment: args.data.comment,
            quantity: args.data.quantity,
            extra: args.data.extra,
            unitType: args.data.unitType,
          },
        })
        await context.pubsub.publish('newExpense', newExpense)
        return newExpense
      },
    })

    t.field('updateExpense', {
      type: 'Expense',
      args: {
        data: nonNull(
          arg({
            type: 'ExpenseUpDateInput',
          }),
        ),
      },
      resolve: async (_, args, context: Context) => {
        let { id, ...data } = args.data as any
        let updateValue: any = {}
        Object.keys(data).forEach((field) => {
          if (data[field] !== undefined || data[field] !== null) {
            updateValue[field] = data[field]
          }
        })
        const updatedExpense = await context.prisma.expense.update({
          data: updateValue,
          where: {
            id: id,
          },
        })
        await context.pubsub.publish('expenseUpdated', updatedExpense)
        return updatedExpense
      },
    })

    t.field('deleteExpense', {
      type: 'Expense',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        let deletedExpense = context.prisma.expense.delete({
          where: {
            id: args.id,
          },
        })
        context.pubsub.publish('newExpense', deletedExpense)
        return deletedExpense
      },
    })

    t.field('createLoan', {
      type: 'Loan',
      args: {
        amount: nonNull(floatArg()),
        releaseDate: arg({type:'Date'})
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.loan.create({
          data: {
            amount: args.amount,
            releseDate: args.releaseDate
          },
        })
      },
    })

    t.field('deleteLoan', {
      type: 'Loan',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.loan.delete({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.field('createUnitType', {
      type: 'UnitTypes',
      args: {
        name: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.unitTypes.create({
          data: {
            name: args.name
          },
        })
      },
    })

    t.field('deleteUnitType', {
      type: 'UnitTypes',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.unitTypes.delete({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.field('createLabourTypes', {
      type: 'LabourTypes',
      args: {
        name: nonNull(stringArg()),
        amount: nonNull(floatArg())
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.labourTypes.create({
          data: {
            name: args.name,
            amount: args.amount
          },
        })
      },
    })

    t.field('deleteLabourTypes', {
      type: 'LabourTypes',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.labourTypes.delete({
          where: {
            id: args.id,
          },
        })
      },
    })

    t.int('createLabourWork', {
      args: {
        data: list(nonNull(arg({
        type:'WorkerCountCreateInput'
      })))
    },
      resolve:async (_, args:any, context: Context) => {
        let count = await context.prisma.labourWork.createMany({
          data: args.data,
        });

        return count.count ?? 0;
      },
    })

    t.field('updateLabourWork', {
      type: 'LabourWork',
      args: {
        id: nonNull(stringArg()),
        workerCount: nonNull(floatArg())
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.labourWork.update({
          where:{
            id: args.id
          },
          data: {
            workerCount: args.workerCount
          },
        })
      },
    })

    t.int('deleteLabourWork', {
      args: {
        date:  nonNull(arg({type:'Date'})),
      },
      resolve: async(_, args, context: Context) => {
        const works = await context.prisma.labourWork.findMany({
          where: {
            workedOn: args.date
          }
        })
        works.forEach(async (val) => await context.prisma.labourWork.delete({
          where: {
            id: val.id
          }
        })
        )
        return works.length
      },
    })

  },
})

export const expenseCreateInput = inputObjectType({
  name: 'ExpenseCreateInput',
  definition(t) {
    t.nonNull.float('amount')
    t.nonNull.string('subCategoryId')
    t.nonNull.boolean('isLoan')
    t.string('comment')
    t.nonNull.float('extra')
    t.nonNull.float('quantity')
    t.date('purchaseDate')
    t.string('unitType')
  },
})


export const workerCountCreateInput = inputObjectType({
  name:'WorkerCountCreateInput',
  definition(t) {
    t.nonNull.string('labourTypeId'),
    t.nonNull.float('workerCount'),
    t.field('workedOn',{type:'Date'})
  },
})

export const expenseUpdateInput = inputObjectType({
  name: 'ExpenseUpDateInput',
  definition(t) {
    t.float('amount')
    t.string('subCategoryId')
    t.boolean('isLoan')
    t.string('comment')
    t.float('extra')
    t.float('quantity')
    t.date('purchaseDate')
    t.string('unitType')
    t.string('id')
    t.boolean('isActive')
  },
})

export const Subscription = subscriptionType({
  definition(t) {
    t.field('newExpense', {
      type: 'Expense',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('newExpense')
      },
      resolve(payload: any) {
        return payload
      },
    })

    t.field('expenseUpdated', {
      type: 'Expense',
      subscribe(_root, _args, ctx) {
        return ctx.pubsub.asyncIterator('expenseUpdated')
      },
      resolve(payload: any) {
        return payload
      },
    })
  },
})
