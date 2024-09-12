using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ASP_P15.Models.Group
{
    public class GroupFormModel
    {
        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "group-name")]
        public String Name { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "group-description")]
        public String Description { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "group-slug")]
        public String Slug { get; set; } = null!;


        [Required(ErrorMessage = "Поле не може бути порожнім")]
        [FromForm(Name = "group-picture")]
        [JsonIgnore]
        public IFormFile ImageFile { get; set; } = null!;
    }
}
