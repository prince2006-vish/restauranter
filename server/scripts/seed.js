import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import FoodCategory from "../models/FoodCategory.js";
import Food from "../models/Food.js";
import RestaurantSettings from "../models/RestaurantSettings.js";
import Offer from "../models/Offer.js";
import GalleryImage from "../models/GalleryImage.js";
import Review from "../models/Review.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/meetha_pani";

const seedDatabase = async () => {
  try {
    console.log("[Seed] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to database.");

    // 1. Seed Administrator
    console.log("[Seed] Checking default admin...");
    const adminExists = await Admin.findOne({ username: "admin" });
    if (!adminExists) {
      await Admin.create({
        username: "admin",
        email: "admin@meethapani.com",
        password: "AdminPassword123!",
        fullName: "Meetha Pani General Manager",
        role: "superadmin",
      });
      console.log(
        "[Seed] Superadmin created (Username: admin | Password: AdminPassword123!)",
      );
    } else {
      console.log("[Seed] Admin already exists.");
    }

    // 2. Seed Restaurant Settings
    console.log("[Seed] Setting up Restaurant Settings...");
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({
        restaurantName: "Meetha Pani",
        tagline: "Authentic Indian Flavors Steeped in Heritage",
        logo: "",
        heroTitle: "Royal Indian Gastronomy, Handcrafted with Love",
        heroSubtitle:
          "From simmering handi curries and fragrant dum biryanis to melt-in-mouth gulab jamuns—taste authentic heritage prepared fresh daily.",
        heroImage:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
        heroButtonPrimary: "Order on WhatsApp",
        heroButtonSecondary: "Explore Our Menu",
        aboutTitle: "The Story Behind Meetha Pani",
        aboutText:
          "Born from our love for age-old recipes and royal khansama culinary arts, Meetha Pani celebrates honest flavors, uncompromised purity of desi ghee, and warm Indian hospitality.",
        aboutStory:
          "Founded in the heart of the city, every spice blend is roasted in-house and every slow-cooked handi is nurtured with patience. Whether dining with family or savoring at home, every morsel is a celebration.",
        aboutImages: [
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        ],
        contactPhone: "+91 98765 43210",
        whatsappPhone: "918853260723",
        email: "contact@meethapani.com",
        address:
          "42, Heritage Boulevard, Civil Lines, Jaipur, Rajasthan 302006",
        googleMapsEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113886.97446554862!2d75.72051786938927!3d26.912433649432684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db479f9b1c72b%3A0xe3fbd62c34be4070!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
        googleMapsDirectionsUrl:
          "https://maps.google.com/?q=Meetha+Pani+Jaipur",
        openingHours: "Mon - Sun: 11:30 AM – 11:30 PM",
        deliveryFee: 40,
        minOrderAmount: 200,
        deliveryEnabled: true,
        takeawayEnabled: true,
        currencySymbol: "₹",
        announcementBanner: {
          enabled: true,
          text: "🎉 Welcome to Meetha Pani! Enjoy Flat 15% OFF your first WhatsApp order with code MEETHA15",
        },
        seoTitle: "Meetha Pani | Authentic Indian Dining & WhatsApp Orders",
        seoDescription:
          "Order mouthwatering royal curries, kebabs, fragrant biryani, and desi desserts directly on WhatsApp from Meetha Pani.",
      });
      console.log("[Seed] Restaurant settings initialized.");
    }

    // 3. Seed Categories
    console.log("[Seed] Setting up categories...");
    const categoryData = [
      {
        name: "Starters & Kebabs",
        slug: "starters-kebabs",
        description: "Tandoori sizzlers, juicy tikkas, and crispy appetizers.",
        order: 1,
        image:
          "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Royal Main Course",
        slug: "royal-main-course",
        description:
          "Slow-cooked handi gravies, creamy paneer, and rich curries.",
        order: 2,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Biryani & Rice",
        slug: "biryani-rice",
        description:
          "Dum-cooked aromatic basmati rice layered with delicate saffron and spices.",
        order: 3,
        image:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Tandoori Breads",
        slug: "tandoori-breads",
        description:
          "Freshly baked buttery naans, rotis, and stuffed parathas.",
        order: 4,
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Meetha & Desserts",
        slug: "meetha-desserts",
        description:
          "Traditional sweets, rich rabri, warm halwas, and signature ice creams.",
        order: 5,
        image:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      },
      {
        name: "Beverages & Coolers",
        slug: "beverages-coolers",
        description:
          "Thandi lassi, masala chaas, and refreshing fruit coolers.",
        order: 6,
        image:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      },
    ];

    const categoryMap = {};
    for (const cat of categoryData) {
      let savedCat = await FoodCategory.findOne({ slug: cat.slug });
      if (!savedCat) {
        savedCat = await FoodCategory.create(cat);
      }
      categoryMap[cat.slug] = savedCat._id;
    }
    console.log("[Seed] Categories initialized.");

    // 4. Seed Foods
    console.log("[Seed] Seeding menu items...");
    const foodItems = [
      // Starters
      {
        name: "Paneer Tikka Angara",
        slug: "paneer-tikka-angara",
        shortDescription:
          "Cottage cheese marinated in Kashmiri spices and chargrilled in a clay tandoor.",
        fullDescription:
          "Fresh malai paneer cubes marinated overnight with hung curd, roasted gram flour, and aromatic whole spices, smoked over live charcoal embers.",
        price: 290,
        discountPrice: 260,
        category: categoryMap["starters-kebabs"],
        image:
          "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "20 mins",
        tags: ["bestseller", "tandoori", "spicy"],
        dietaryInfo: ["Vegetarian", "Gluten-Free"],
      },
      {
        name: "Dahi Ke Kebab",
        slug: "dahi-ke-kebab",
        shortDescription:
          "Crisp golden patties filled with creamy spiced hung curd and fresh herbs.",
        fullDescription:
          "Silky hung yogurt infused with cardamom, green chilies, and coriander, gently pan-fried to a crisp golden crust.",
        price: 260,
        discountPrice: null,
        category: categoryMap["starters-kebabs"],
        image:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "15 mins",
        tags: ["melt-in-mouth", "chef-special"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Murgh Malai Tikka",
        slug: "murgh-malai-tikka",
        shortDescription:
          "Tender chicken cubes in a rich cashew, cream, and green cardamom marinade.",
        fullDescription:
          "Boneless farm chicken pieces steeped in cream, royal cheese, white pepper, and mace, roasted till succulent and tender.",
        price: 360,
        discountPrice: 320,
        category: categoryMap["starters-kebabs"],
        image:
          "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        availability: "available",
        isFeatured: true,
        prepTime: "25 mins",
        tags: ["non-veg", "mild", "popular"],
        dietaryInfo: ["Non-Vegetarian", "High-Protein"],
      },
      {
        name: "Tandoori Soya Chaap",
        slug: "tandoori-soya-chaap",
        shortDescription:
          "Succulent soya fillets marinated in tangy tandoori masala and lemon butter.",
        fullDescription:
          "High-protein soya chaap roasted in the tandoor and tossed with onion rings, chaat masala, and creamy mint chutney.",
        price: 240,
        discountPrice: null,
        category: categoryMap["starters-kebabs"],
        image:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: false,
        prepTime: "15 mins",
        tags: ["healthy", "smoky"],
        dietaryInfo: ["Vegetarian"],
      },

      // Main Course
      {
        name: "Dal Meetha Pani (Signature Dal Makhani)",
        slug: "dal-meetha-pani-signature",
        shortDescription:
          "Slow-cooked black lentils simmered for 18 hours with butter and cream.",
        fullDescription:
          "Our hallmark dish. Urad lentils and rajma cooked overnight on low charcoal heat, finished with fresh churned white butter, kasoori methi, and pure cream.",
        price: 310,
        discountPrice: 280,
        category: categoryMap["royal-main-course"],
        image:
          "https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "20 mins",
        tags: ["signature", "bestseller", "creamy"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Paneer Lababdar",
        slug: "paneer-lababdar",
        shortDescription:
          "Soft cottage cheese chunks in a rich tomato, onion, and grated paneer gravy.",
        fullDescription:
          "Velvety gravy made from vine-ripe tomatoes, cashews, and aromatic spices with hand-crumbled paneer for a hearty mouthfeel.",
        price: 340,
        discountPrice: null,
        category: categoryMap["royal-main-course"],
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "20 mins",
        tags: ["chef-recommendation", "rich"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Murgh Handi Khas",
        slug: "murgh-handi-khas",
        shortDescription:
          "Country chicken cooked in an earthen clay pot with whole spices and brown onion paste.",
        fullDescription:
          "Tender chicken simmered in clay handi with freshly ground coriander seeds, Kashmiri chili, and slow-fried golden onions.",
        price: 420,
        discountPrice: 380,
        category: categoryMap["royal-main-course"],
        image:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        availability: "available",
        isFeatured: true,
        prepTime: "30 mins",
        tags: ["non-veg", "authentic", "claypot"],
        dietaryInfo: ["Non-Vegetarian"],
      },
      {
        name: "Subz Diwani Handi",
        slug: "subz-diwani-handi",
        shortDescription:
          "Melange of seasonal vegetables tossed in a mild cashew and spinach gravy.",
        fullDescription:
          "Garden-fresh florets of cauliflower, baby carrots, French beans, and green peas gently tossed in a creamy emerald sauce.",
        price: 280,
        discountPrice: null,
        category: categoryMap["royal-main-course"],
        image:
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: false,
        prepTime: "20 mins",
        tags: ["healthy", "vegetarian"],
        dietaryInfo: ["Vegetarian"],
      },

      // Biryani
      {
        name: "Nawabi Dum Biryani (Vegetable)",
        slug: "nawabi-dum-biryani-veg",
        shortDescription:
          "Layered basmati rice with fragrant saffron, caramelized onions, and garden vegetables.",
        fullDescription:
          "Dum-sealed with dough in a copper vessel, infused with rose water, kewra, mint, and pure saffron strands. Served with burani raita.",
        price: 320,
        discountPrice: 290,
        category: categoryMap["biryani-rice"],
        image:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "25 mins",
        tags: ["dum-biryani", "saffron", "classic"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Shahi Gosht Dum Biryani",
        slug: "shahi-gosht-dum-biryani",
        shortDescription:
          "Slow-dum goat meat layered with aged basmati rice and royal spices.",
        fullDescription:
          "Tender baby goat cuts cooked in their own juices with long-grain Dehradun rice, ghee, roasted dry fruits, and aromatic spices.",
        price: 490,
        discountPrice: 450,
        category: categoryMap["biryani-rice"],
        image:
          "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
        isVeg: false,
        availability: "available",
        isFeatured: true,
        prepTime: "30 mins",
        tags: ["mutton", "royal", "bestseller"],
        dietaryInfo: ["Non-Vegetarian"],
      },

      // Breads
      {
        name: "Garlic Butter Naan",
        slug: "garlic-butter-naan",
        shortDescription:
          "Soft leavened flatbread topped with minced garlic, fresh coriander, and melted butter.",
        fullDescription:
          "Baked fresh against the blazing walls of our tandoor, brushed generously with churned butter.",
        price: 75,
        discountPrice: null,
        category: categoryMap["tandoori-breads"],
        image:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: false,
        prepTime: "10 mins",
        tags: ["bread", "must-try"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Chur Chur Laccha Paratha",
        slug: "chur-chur-laccha-paratha",
        shortDescription:
          "Multi-layered flaky whole wheat bread crushed with desi ghee.",
        fullDescription:
          "Golden crispy whole-wheat paratha layered with ajwain and mint, gently crushed by hand to release its flaky layers.",
        price: 85,
        discountPrice: null,
        category: categoryMap["tandoori-breads"],
        image:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: false,
        prepTime: "10 mins",
        tags: ["crispy", "desi-ghee"],
        dietaryInfo: ["Vegetarian"],
      },

      // Desserts (Meetha)
      {
        name: "Shahi Tukda with Rabri",
        slug: "shahi-tukda-with-rabri",
        shortDescription:
          "Crisp ghee-fried brioche soaked in saffron cardamom syrup, topped with thick rabri.",
        fullDescription:
          "The royal dessert of Awadh. Golden crisp bread bathed in rose chashni, crowned with slow-reduced malai rabri and crushed pistachios.",
        price: 210,
        discountPrice: 190,
        category: categoryMap["meetha-desserts"],
        image:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "15 mins",
        tags: ["sweet", "signature", "dessert"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Gulab Jamun with Rose Caviar",
        slug: "gulab-jamun-rose-caviar",
        shortDescription:
          "Hot mawa dumplings stuffed with saffron pistachios, served in warm syrup.",
        fullDescription:
          "Two pieces of melt-in-mouth khoya jamuns made the traditional way, scented with green cardamom and natural wild rose petals.",
        price: 160,
        discountPrice: null,
        category: categoryMap["meetha-desserts"],
        image:
          "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "10 mins",
        tags: ["classic-sweet"],
        dietaryInfo: ["Vegetarian"],
      },

      // Beverages
      {
        name: "Kesariya Kulhad Lassi",
        slug: "kesariya-kulhad-lassi",
        shortDescription:
          "Thick churned sweet yogurt topped with saffron malai and silver varq in an earthen cup.",
        fullDescription:
          "Velvety fresh curd blended with wild blossom honey, saffron, and cardamom, garnished with almond slivers and served chilled.",
        price: 150,
        discountPrice: 130,
        category: categoryMap["beverages-coolers"],
        image:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: true,
        prepTime: "5 mins",
        tags: ["beverage", "chilled", "refreshing"],
        dietaryInfo: ["Vegetarian"],
      },
      {
        name: "Masala Shikanji Soda",
        slug: "masala-shikanji-soda",
        shortDescription:
          "Fizzy lemon cooler with roasted cumin, rock salt, mint, and ginger.",
        fullDescription:
          "Freshly squeezed Indian lemons infused with secret roasted rock salt and mint concoction, topped with sparkling club soda.",
        price: 110,
        discountPrice: null,
        category: categoryMap["beverages-coolers"],
        image:
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        availability: "available",
        isFeatured: false,
        prepTime: "5 mins",
        tags: ["cooler", "digestive"],
        dietaryInfo: ["Vegetarian", "Vegan"],
      },
    ];

    for (const item of foodItems) {
      const exists = await Food.findOne({ slug: item.slug });
      if (!exists) {
        await Food.create(item);
      }
    }
    console.log("[Seed] Menu items seeded.");

    // 5. Seed Offers
    console.log("[Seed] Seeding offers...");
    const offersData = [
      {
        title: "First Order Special",
        code: "MEETHA15",
        description:
          "Get Flat 15% OFF on your first order placed via WhatsApp checkout.",
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 300,
        maxDiscountAmount: 150,
        isActive: true,
      },
      {
        title: "Feast & Save Flat ₹50",
        code: "FLAT50",
        description: "Instant ₹50 discount on delicious dining above ₹250.",
        discountType: "flat",
        discountValue: 50,
        minOrderAmount: 250,
        maxDiscountAmount: 50,
        isActive: true,
      },
    ];

    for (const off of offersData) {
      const exists = await Offer.findOne({ code: off.code });
      if (!exists) {
        await Offer.create(off);
      }
    }
    console.log("[Seed] Offers seeded.");

    // 6. Seed Gallery
    console.log("[Seed] Seeding restaurant gallery...");
    const galleryData = [
      {
        title: "Royal Dining Ambiance",
        imageUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
        category: "interior",
        caption: "Warm ambient lighting and handcrafted royal furnishings.",
        order: 1,
      },
      {
        title: "Live Tandoor & Charcoal Kitchen",
        imageUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
        category: "kitchen",
        caption:
          "Our culinary artists crafting kebabs and breads fresh before your eyes.",
        order: 2,
      },
      {
        title: "Signature Dal Makhani Handi",
        imageUrl:
          "https://images.unsplash.com/photo-1546833998-877b37c2e5c4?auto=format&fit=crop&w=1000&q=80",
        category: "food",
        caption: "Simmered overnight in pure white butter.",
        order: 3,
      },
      {
        title: "Heritage Courtyard Evening",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
        category: "exterior",
        caption: "Open-air candlelit dinner experience under the stars.",
        order: 4,
      },
      {
        title: "Royal Biryani Pot Unsealed",
        imageUrl:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80",
        category: "food",
        caption: "Aromatic saffron fragrance filling the dining hall.",
        order: 5,
      },
    ];

    for (const gal of galleryData) {
      const exists = await GalleryImage.findOne({ title: gal.title });
      if (!exists) {
        await GalleryImage.create(gal);
      }
    }
    console.log("[Seed] Gallery seeded.");

    // 7. Seed Reviews
    console.log("[Seed] Seeding customer testimonials...");
    const reviewsData = [
      {
        customerName: "Ananya Sharma",
        rating: 5,
        comment:
          "The Dal Meetha Pani is truly unbeatable! The WhatsApp ordering was exceptionally smooth—within 2 minutes my order was confirmed and fresh piping hot food arrived.",
        dishMentioned: "Dal Meetha Pani & Garlic Naan",
        isApproved: true,
        isFeatured: true,
      },
      {
        customerName: "Rohan Rathore",
        rating: 5,
        comment:
          "Outstanding flavor profile. The Dum Biryani has an unmatched authentic aroma of saffron and spices. Will definitely order regularly for family gatherings.",
        dishMentioned: "Nawabi Dum Biryani",
        isApproved: true,
        isFeatured: true,
      },
      {
        customerName: "Pooja Verma",
        rating: 5,
        comment:
          "Dahi Ke Kebab literally melted in my mouth! The packaging was spotless and the live tracking link on the website gave us exact updates.",
        dishMentioned: "Dahi Ke Kebab & Shahi Tukda",
        isApproved: true,
        isFeatured: true,
      },
    ];

    for (const rev of reviewsData) {
      const exists = await Review.findOne({ customerName: rev.customerName });
      if (!exists) {
        await Review.create(rev);
      }
    }
    console.log("[Seed] Reviews seeded.");

    console.log("[Seed] DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
