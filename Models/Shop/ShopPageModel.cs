using ASP_P15.Data.Entities;
using ASP_P15.Models.Group;
using ASP_P15.Models.Home;

namespace ASP_P15.Models.Shop
{
    public class ShopPageModel
    {
        public ShopProductFormModel? FormModel { get; set; }
        public IEnumerable<ProductGroup> ProductGroups { get; set; }
        public GroupFormModel GroupFormModel { get; set; } = new GroupFormModel();
        public Dictionary<String, String?>? ValidationErrors { get; set; }
    }
}
