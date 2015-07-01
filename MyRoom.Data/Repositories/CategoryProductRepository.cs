﻿using MyRoom.Model;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MyRoom.Data.Repositories
{
    public class CategoryProductRepository : GenericRepository<CategoryProduct>
    {
        public MyRoomDbContext Context { get; private set; }
        public CategoryProductRepository(MyRoomDbContext context)
            : base(context)
        {
            this.Context = context;
        }

        public void InsertCategoryProduct(List<CategoryProduct> categoryProds)
        {
            this.DeleteCategoryProduct(categoryProds[0].IdCategory);
            if (categoryProds[0].IdCategory != 0)
            {
                categoryProds.ForEach(delegate(CategoryProduct categoryProd)
                {
                    this.Insert(categoryProd);
                });
            }
        }

        public void DeleteCategoryProduct(int categoryId)
        {
            List<CategoryProduct> categories = this.Context.CategoryProducts.Where(c => c.IdCategory == categoryId).ToList();
            try
            {
                this.DeleteCollection(categories);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public List<CategoryProduct> GetCategoryById(int id)
        {
            var categoryProducts = (from c in this.Context.CategoryProducts
                            where c.IdCategory == id
                            select c).ToList();


            return categoryProducts;
        }

        public IQueryable<CategoryProduct> GetCategoryProduct(int id)
        {
            return this.Context.CategoryProducts.Where(c => c.IdCategory == id);
        }
    }
}