import {
    objectType,
  } from 'nexus'
  import { Context } from '../context'


export const Category = objectType({
    name: 'Category',
    definition(t) {
      t.nonNull.string('id')
      t.nonNull.string('name')
      t.nonNull.boolean('isActive')
      t.nonNull.boolean('isDeleted')
      t.field('createdAt', { type: 'DateTime' })
      t.field('updatedAt', { type: 'DateTime' })
      t.list.field('subCategories', {
        type: 'SubCategory',
        resolve: (parent, _, context: Context) => {
          return context.prisma.category
            .findUnique({
              where: { id: parent.id || undefined },
            })
            .subCategories()
        },
      })
    },
  })
  
  export const SubCategory = objectType({
    name: 'SubCategory',
    definition(t) {
      t.nonNull.string('id')
      t.nonNull.string('name')
      t.nonNull.boolean('isActive')
      t.nonNull.boolean('isDeleted')
      t.field('createdAt', { type: 'DateTime' })
      t.field('updatedAt', { type: 'DateTime' })
      t.nonNull.string('categoryId')
      t.int('count', {
        resolve: (parent, _, context: Context) => {
          return context.prisma.expense.count({
            where: { subCategoryId: parent.id || undefined },
          })
        },
      })
      t.field('category', {
        type: 'Category',
        resolve: (parent, _, context: Context) => {
          return context.prisma.category.findFirst({
            where: { id: parent.categoryId || undefined },
          })
        },
      })
    },
  })
  
  export const Expense = objectType({
    name: 'Expense',
    definition(t) {
      t.nonNull.string('id')
      t.nonNull.string('subCategoryId')
      t.field('subCategory', {
        type: 'SubCategory',
        resolve: (parent, _, context: Context) => {
          return context.prisma.subCategory.findFirst({
            where: { id: parent.subCategoryId || undefined },
          })
        },
      })
      t.field('category', {
        type: 'Category',
        resolve: (parent, _, context: Context) => {
          return context.prisma.subCategory
            .findFirst({
              where: { id: parent.subCategoryId || undefined },
            })
            .category()
        },
      })
      t.field('createdAt', { type: 'DateTime' })
      t.field('updatedAt', { type: 'DateTime' })
      t.nonNull.boolean('isActive')
      t.nonNull.boolean('isDeleted')
      t.nonNull.boolean('isLoan')
      t.string('comment')
      t.string('unitType')
      t.float('extra')
      t.float('amount')
      t.float('quantity')
      t.field('purchaseDate', { type: 'Date' })
    },
  })
  
  export const Loan = objectType({
      name:'Loan',
      definition(t) {
          t.nonNull.string('id')
          t.field('releseDate', { type: 'Date' })
          t.float('amount')
          t.field('createdAt', { type: 'DateTime' })
          t.field('updatedAt', { type: 'DateTime' })
      },
  })
  
  export const UnitTypes = objectType({
      name:'UnitTypes',
      definition(t) {
          t.nonNull.string('id')
          t.nonNull.string('name')
          t.nonNull.boolean('isActive')
          t.field('createdAt', { type: 'DateTime' })
          t.field('updatedAt', { type: 'DateTime' })
      },
  })
  
  export const LabourTypes = objectType({
      name:'LabourTypes',
      definition(t) {
          t.nonNull.string('id')
          t.nonNull.string('name')
          t.float('amount')
          t.nonNull.boolean('isActive')
          t.field('createdAt', { type: 'DateTime' })
          t.field('updatedAt', { type: 'DateTime' })
          t.int('count', {
              resolve: (parent, _, context: Context) => {
                return context.prisma.labourWork.count({
                  where: { labourTypeId: parent.id || undefined },
                })
              },
            })
      },
  })
  
  export const LabourWork = objectType({
      name:'LabourWork',
      definition(t) {
          t.nonNull.string('id')
          t.nonNull.string('labourTypeId')
          t.float('workerCount')
          t.field('workedOn',{type:'Date'})
          t.nonNull.boolean('isActive')
          t.field('labourType', {
              type: 'LabourTypes',
              resolve: (parent, _, context: Context) => {
                return context.prisma.labourWork
                  .findFirst({
                    where: { id: parent.id || undefined },
                  })
                  .labourType()
              },
            })
          t.field('labourName', {
              type: 'String',
              resolve: (parent, _, context: Context) => {
                return context.prisma.labourWork
                  .findFirst({
                    where: { id: parent.id || undefined },
                  })
                  .labourType().then(value => value?.name ?? "")
              },
            })
          t.field('createdAt', { type: 'DateTime' })
          t.field('updatedAt', { type: 'DateTime' })
      },
  })