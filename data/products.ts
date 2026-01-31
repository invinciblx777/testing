export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string[];
    sizes: string[];
    inStock: boolean;
    category: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    // New fields
    stockTotal: number;
    stockRemaining: number;
    discountType?: "percentage" | "flat" | null;
    discountValue?: number;
    // New field for size-specific stock
    sizeCounts?: Record<string, number>;
}

export const CATEGORIES = [
    { id: 'kurtis', name: 'Kurtis', image: '' },
    { id: 'sets', name: '3-Piece Sets', image: '' },
    { id: 'daily', name: 'Daily Wear', image: '' },
    { id: 'dresses', name: 'Dresses', image: '' },
    { id: 'traditional', name: 'Traditional', image: '' },
    { id: 'maxis', name: 'Maxis', image: '' },
    { id: 'aline', name: 'A-Line', image: '' },
    { id: 'short', name: 'Short Tops', image: '' },
    { id: 'tot', name: 'TOT Wear', image: '' },
    { id: 'workwear', name: 'Workwear', image: '' },
    { id: 'festive', name: 'Festive Wear', image: '' },
];

export const PRODUCTS: Product[] = [
    {
        id: '1',
        slug: 'nigeen-kashmiri-aari-light-green-kurti',
        name: 'Nigeen Kashmiri Aari Light Green Kurti',
        description: 'Light Green Kashmiri Aari Embroidery Kurti, crafted from Cotton with intricate green and white embroidery.',
        price: 1299,
        discountPrice: 999,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'kurtis',
        isBestSeller: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '2',
        slug: 'royal-silk-festive-set',
        name: 'Royal Silk Festive Set',
        description: 'Premium silk three-piece set with heavy gold zari work. Ideal for weddings and festivals.',
        price: 4599,
        images: [
            ''
        ],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'traditional',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '3',
        slug: 'office-chic-coord',
        name: 'Office Chic Co-ord',
        description: 'Modern minimalist co-ord set for the professional woman.',
        price: 2499,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'workwear',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '4',
        slug: 'blue-floral-ruffle-maxi',
        name: 'Blue Floral Ruffle Maxi',
        description: 'Stunning blue floral maxi dress featuring off-shoulder ruffle details.',
        price: 1899,
        discountPrice: 1599,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        inStock: true,
        category: 'maxis',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '5',
        slug: 'embroidered-cotton-suit-set',
        name: 'Embroidered Cotton Suit Set',
        description: 'Elegant 3-piece cotton suit set with dupatta.',
        price: 2999,
        images: [
            ''
        ],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'sets',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '6',
        slug: 'block-print-daily-kurta',
        name: 'Block Print Daily Kurta',
        description: 'Comfortable daily wear kurti with traditional hand block prints.',
        price: 899,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'daily',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '7',
        slug: 'summer-floral-dress',
        name: 'Summer Floral Dress',
        description: 'Breezy floral dress for casual outings.',
        price: 1499,
        discountPrice: 1299,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'dresses',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '8',
        slug: 'traditional-silk-anarkali',
        name: 'Traditional Silk Anarkali',
        description: 'Rich silk anarkali suit with heavy embroidery.',
        price: 5999,
        images: [
            ''
        ],
        sizes: ['M', 'L', 'XL', 'XXL'],
        inStock: true,
        category: 'traditional',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '9',
        slug: 'pink-aline-kurta',
        name: 'Pink A-Line Kurta',
        description: 'Stylish A-line kurta in pastel pink.',
        price: 1199,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'aline',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '10',
        slug: 'casual-short-tunic',
        name: 'Casual Short Tunic',
        description: 'Trendy short tunic top that pairs perfectly with jeans.',
        price: 799,
        images: [
            ''
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        inStock: true,
        category: 'short',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '11',
        slug: 'fusion-jacket-set',
        name: 'Fusion Jacket Set',
        description: 'Contemporary fusion wear featuring a stylish jacket.',
        price: 3499,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'tot',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '12',
        slug: 'maroon-velvet-kurti',
        name: 'Maroon Velvet Kurti',
        description: 'Luxurious maroon velvet kurti with golden embroidery.',
        price: 1999,
        images: [
            ''
        ],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'kurtis',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '13',
        slug: 'georgette-gown-set',
        name: 'Georgette Gown Set',
        description: 'Flowy georgette gown with heavy embellished dupatta.',
        price: 4999,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'sets',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '14',
        slug: 'cotton-daily-print',
        name: 'Cotton Daily Print',
        description: 'Soft cotton printed kurti, ideal for summer days.',
        price: 699,
        images: [
            ''
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'daily',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '15',
        slug: 'elegant-evening-dress',
        name: 'Elegant Evening Dress',
        description: 'Sophisticated evening dress in midnight blue.',
        price: 2599,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'dresses',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '16',
        slug: 'festive-sharara-set',
        name: 'Festive Sharara Set',
        description: 'Vibrant yellow sharara set with mirror work.',
        price: 3999,
        images: [
            ''
        ],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'traditional',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '17',
        slug: 'boho-maxi-dress',
        name: 'Boho Maxi Dress',
        description: 'Bohemian style maxi dress with earthy tones.',
        price: 2199,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'maxis',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '18',
        slug: 'indigo-aline-kurta',
        name: 'Indigo A-Line Kurta',
        description: 'Classic indigo printed A-line kurta.',
        price: 1099,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'aline',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '19',
        slug: 'modern-crop-top',
        name: 'Modern Crop Top',
        description: 'Chic crop top with embroidery details.',
        price: 899,
        images: [
            ''
        ],
        sizes: ['XS', 'S', 'M'],
        inStock: true,
        category: 'short',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '20',
        slug: 'urban-tot-ensemble',
        name: 'Urban TOT Ensemble',
        description: 'Edgy urban wear set for the modern youth.',
        price: 2799,
        images: [
            ''
        ],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'tot',
        stockTotal: 0,
        stockRemaining: 0,
    },
    {
        id: '21',
        slug: 'executive-blazer-set',
        name: 'Executive Blazer Set',
        description: 'Professional blazer and trouser set in charcoal grey.',
        price: 3499,
        images: [''],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'workwear',
        isNew: true,
        stockTotal: 0,
        stockRemaining: 0,
    },
    // --- NEW PRODUCTS ADDED ---
    // Kurtis (Existing: 2, Need +2)
    {
        id: '22',
        slug: 'yellow-sunshine-kurti',
        name: 'Yellow Sunshine Kurti',
        description: 'Bright yellow cotton kurti with white thread work.',
        price: 999,
        images: [''],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'kurtis',
        stockTotal: 10,
        stockRemaining: 10,
    },
    {
        id: '23',
        slug: 'black-modal-kurti',
        name: 'Black Modal Kurti',
        description: 'Classic black modal silk kurti appropriate for evening wear.',
        price: 1499,
        images: [''],
        sizes: ['M', 'L', 'XL', 'XXL'],
        inStock: true,
        category: 'kurtis',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // 3-Piece Sets (Existing: 2, Need +2)
    {
        id: '24',
        slug: 'pastel-pink-sharara-set',
        name: 'Pastel Pink Sharara Set',
        description: 'Soft pink sharara set with gota patti work.',
        price: 3299,
        images: [''],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'sets',
        stockTotal: 10,
        stockRemaining: 10,
    },
    {
        id: '25',
        slug: 'emerald-green-palazzo-set',
        name: 'Emerald Green Palazzo Set',
        description: 'Rich emerald green straight suit with palazzo pants.',
        price: 2899,
        images: [''],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'sets',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Daily Wear (Existing: 2, Need +2)
    {
        id: '26',
        slug: 'ikat-print-cotton-kurta',
        name: 'Ikat Print Cotton Kurta',
        description: 'Traditional Ikat print kurta in breathable cotton.',
        price: 799,
        images: [''],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'daily',
        stockTotal: 10,
        stockRemaining: 10,
    },
    {
        id: '27',
        slug: 'beige-casual-kurti',
        name: 'Beige Casual Kurti',
        description: 'Simple beige kurti for everyday elegance.',
        price: 699,
        images: [''],
        sizes: ['XS', 'S', 'M', 'L'],
        inStock: true,
        category: 'daily',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Dresses (Existing: 2, Need +1)
    {
        id: '28',
        slug: 'bohemian-wrap-dress',
        name: 'Bohemian Wrap Dress',
        description: 'Flowy wrap dress perfect for beach vacations.',
        price: 1699,
        images: [''],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'dresses',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Traditional Wear (Existing: 2, Need +1)
    {
        id: '29',
        slug: 'banarasi-silk-saree',
        name: 'Banarasi Silk Saree',
        description: 'Authentic Banarasi silk saree in royal blue.',
        price: 6999,
        images: [''],
        sizes: ['Free Size'],
        inStock: true,
        category: 'traditional',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Maxis (Existing: 2, Need +1)
    {
        id: '30',
        slug: 'tierred-cotton-maxi',
        name: 'Tiered Cotton Maxi',
        description: 'Comfortable tiered maxi dress in floral print.',
        price: 1599,
        images: [''],
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        category: 'maxis',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // A-Line (Existing: 2, Need +1)
    {
        id: '31',
        slug: 'rust-orange-aline',
        name: 'Rust Orange A-Line',
        description: 'Vibrant rust orange A-line kurta.',
        price: 1199,
        images: [''],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'aline',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Short Tops (Existing: 2, Need +1)
    {
        id: '32',
        slug: 'peplum-short-top',
        name: 'Peplum Short Top',
        description: 'Cute peplum style short top.',
        price: 849,
        images: [''],
        sizes: ['XS', 'S', 'M'],
        inStock: true,
        category: 'short',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // TOT Wear (Existing: 2, Need +1)
    {
        id: '33',
        slug: 'denim-fusion-jacket',
        name: 'Denim Fusion Jacket',
        description: 'Embroidered denim jacket for a fusion look.',
        price: 2199,
        images: [''],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'tot',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Workwear (Existing: 2, Need +1)
    {
        id: '34',
        slug: 'striped-linen-kurta',
        name: 'Striped Linen Kurta',
        description: 'Professional striped linen kurta for office wear.',
        price: 1399,
        images: [''],
        sizes: ['M', 'L', 'XL', 'XXL'],
        inStock: true,
        category: 'workwear',
        stockTotal: 10,
        stockRemaining: 10,
    },
    // Festive Wear (New Category, Need +3)
    {
        id: '35',
        slug: 'mirror-work-lehenga',
        name: 'Mirror Work Lehenga',
        description: 'Dazzling lehenga choli with mirror embellishments.',
        price: 7999,
        images: [''],
        sizes: ['S', 'M', 'L'],
        inStock: true,
        category: 'festive',
        isNew: true,
        stockTotal: 10,
        stockRemaining: 10,
    },
    {
        id: '36',
        slug: 'designer-net-saree',
        name: 'Designer Net Saree',
        description: 'Sheer net saree with stone work borders.',
        price: 4499,
        images: [''],
        sizes: ['Free Size'],
        inStock: true,
        category: 'festive',
        stockTotal: 10,
        stockRemaining: 10,
    },
    {
        id: '37',
        slug: 'velvet-palazzo-suit',
        name: 'Velvet Palazzo Suit',
        description: 'Regal velvet suit suitable for winter weddings.',
        price: 5499,
        images: [''],
        sizes: ['M', 'L', 'XL'],
        inStock: true,
        category: 'festive',
        stockTotal: 10,
        stockRemaining: 10,
    }
];
