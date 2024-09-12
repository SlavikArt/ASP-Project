using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ASP_P15.Models.Shop
{
    public class ShopProductFormModel
    {
        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "product-name")]
        public String Name { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "product-description")]
        public String Description { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "product-slug")]
        public String? Slug { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "product-picture")]
        [JsonIgnore]
        public IFormFile ImageFile { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [Range(1, int.MaxValue, ErrorMessage = "Ціна повинна бути більше 0")]
        [FromForm(Name = "product-price")]
        public double Price { get; set; }


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [Range(1, int.MaxValue, ErrorMessage = "Кількість повинна бути більше 0")]
        [FromForm(Name = "product-amount")]
        public int Amount { get; set; }


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "group-id")]
        public Guid GroupId { get; set; }
    }
}
