﻿using ASP_P15.Data;
using ASP_P15.Data.Entities;
using ASP_P15.Models.Shop;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;
namespace ASP_P15.Controllers
{
    public class ShopController(DataContext dataContext) : Controller
    {
        private readonly DataContext _dataContext = dataContext;

        public IActionResult Index()
        {
            ShopPageModel model = new()
            {
                ProductGroups = _dataContext.Groups.Where(g => g.DeleteDt == null).ToList()
            };

            if (HttpContext.Session.Keys.Contains("shop-product-data"))
            {
                var formModel = JsonSerializer.Deserialize<ShopProductFormModel>(HttpContext.Session.GetString("shop-product-data")!)!;
                model.FormModel = formModel;
               
                model.ValidationErrors = JsonSerializer.Deserialize<Dictionary<string, string?>>(HttpContext.Session.GetString("shop-product-errors")!);
                ViewData["shopProductData"] = $"name: {formModel.Name}, description: {formModel.Description}, price: {formModel.Price}, amount: {formModel.Amount}";
                HttpContext.Session.Remove("shop-product-data");
                HttpContext.Session.Remove("shop-product-errors");
            }

            return View(model);
        }

        public IActionResult Group(String id)
        {
            // Розглядаємо можливість, що id - це або slug, або id
            ProductGroup? group = null;
            var source = _dataContext
                .Groups
                .Include(g => g.Products)
                .Where(g => g.DeleteDt == null);

            group = source.FirstOrDefault(g => g.Slug == id);
            if (group == null)   // не знайшли за Slug, шукаємо за Id
            {
                try
                {
                    group = source.FirstOrDefault(g => g.Id == Guid.Parse(id));
                }
                catch { }
            }
            if (group == null)   // не знайдено ані за Slug, ані за Id
            {
                return View("Page404");
            }
            ShopGroupPageModel model = new()
            {
                ProductGroup = group,
                Groups = source,
            };
            return View(model);
        }

        public IActionResult Product(String id)
        {
            Product? product = null;

            var source = _dataContext
                .Products
                .Where(p => p.DeleteDt == null)
                .Include(p => p.Group);

            product = source
                .FirstOrDefault(p => p.Slug == id);

            if(product == null)
            {
                product = source
                    .FirstOrDefault(p => p.Id.ToString() == id);
            }
            if (product == null)
            {
                return View("Page404");
            }

            ShopProductPageModel model = new()
            {
                Product = product,
                ProductGroup = product.Group,
            };

            return View(model);
        }
    }
}

/* Slug - ідентифікатор ресурсу (сторінки), сформульований, як правило,
 * зрозумілою для людини мовою
 * 
 * Д.З. Додати до сутності "User" поле ролі "Role" зі значенням за 
 *  замовчанням "Guest".
 * Для деяких користувачів встановити значення "Admin" (в ручну через БД)
 * Обмежити можливість додавання продуктів та їх груп тільки 
 *  користувачам з роллю "Admin"
 */
