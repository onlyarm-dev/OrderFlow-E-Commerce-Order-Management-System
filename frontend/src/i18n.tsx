/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'th';

const en = {
  language: 'EN', thai: 'ไทย', english: 'EN', welcome: 'Welcome', sign_in_store: 'Sign in to your store',
  sign_in_hint: 'Use your account to manage daily operations.', choose_demo_account: 'Choose a demo user to sign in instantly.', create_account: 'Create your account',
  create_account_hint: 'New accounts start with customer access.', first_name: 'First name', last_name: 'Last name',
  email: 'Email address', password: 'Password', please_wait: 'Please wait…', sign_in: 'Sign in',
  new_here: 'New here? Create an account', have_account: 'Already have an account? Sign in', visit_store: 'Visit the storefront →',
  auth_hero_tag: 'One clear operation', auth_hero_title: 'Shop Management',
  auth_hero_body: 'A focused workspace for keeping stock accurate and every order moving.',
  dashboard: 'Dashboard', orders: 'Orders', products: 'Products', marketplace: 'Marketplace', sign_out: 'Sign out', open_store: 'Open storefront',
  morning: 'Good morning', dashboard_hint: 'Here’s what’s happening with your store.', products_title: 'Products & inventory',
  products_hint: 'Keep your catalog and available stock clear.', orders_title: 'Order management', orders_hint: 'Create and track orders in one place.',
  items_catalog: 'Items in catalog', active_orders: 'Active orders', waiting_complete: 'Waiting to complete', low_stock: 'Low stock',
  needs_attention: 'Needs attention', order_value: 'Order value', api_unavailable: 'API unavailable', visible_orders: 'Visible orders',
  recent_orders: 'Recent orders', no_orders_dashboard: 'No orders yet. Create the first order from Orders.', quick_start: 'Quick start',
  workspace_live: 'Your workspace is live.', workspace_body: 'Add products, track available stock, and create orders from the sidebar.',
  api_docs: 'Open API docs →', product_inventory: 'Product inventory', inventory_live: 'Live stock availability from PostgreSQL',
  search_products: 'Search products', add_product: '+ Add product', product: 'Product', sku: 'SKU', price: 'Price', available: 'Available',
  reserved: 'Reserved', status: 'Status', loading_inventory: 'Loading inventory…', no_products: 'No products found.', add_first_product: ' Add the first product.',
  description: 'Description', product_name: 'Product name', short_description: 'Short product description', price_thb: 'Price (THB)',
  initial_quantity: 'Initial quantity', cancel: 'Cancel', saving: 'Saving…', create_product: 'Create product', active: 'Active', inactive: 'Inactive',
  track_orders: 'Track and create customer orders', new_order: '+ New order', order: 'Order', created: 'Created', ship_to: 'Ship to', total: 'Total',
  loading_orders: 'Loading orders…', no_orders: 'No orders yet. Create your first order.', create_order: 'Create order', order_item: 'Order item',
  actions: 'Actions', view_details: 'View details', order_details: 'Order details', customer: 'Customer', ordered_items: 'Ordered items',
  quantity: 'Quantity', unit_price: 'Unit price', subtotal: 'Subtotal', status_history: 'Status history', changed_by: 'Changed by',
  mark_shipped: 'Mark as shipped', mark_delivered: 'Mark as delivered', updating_status: 'Updating status…', close: 'Close',
  select_product: 'Select product', shipping_address: 'Shipping address', recipient_name: 'Recipient name', address_line: 'Address line', city: 'City',
  postal_code: 'Postal code', country_code: 'Country code, e.g. TH', creating: 'Creating…', role_admin: 'Admin', role_staff: 'Staff', role_customer: 'Customer',
  status_pending: 'Pending', status_confirmed: 'Confirmed', status_processing: 'Processing', status_shipped: 'Shipped', status_delivered: 'Delivered', status_cancelled: 'Cancelled',
  shop_new: 'New arrivals', shop_collection_link: 'Collection', manage_store: 'Manage store', hi: 'Hi', bag: 'Bag',
  shop_tag: 'The studio collection · 2026', shop_title_1: 'Useful things,', shop_title_2: 'made to last.',
  shop_intro: 'Considered essentials for work, rest, and everywhere between. Designed simply. Built honestly.', shop_cta: 'Shop the collection ↓',
  featured: 'Featured', featured_title: 'Objects for everyday rhythm.', featured_note: 'Small batch · Thoughtful materials', shop_all: 'Shop all',
  collection: 'The collection', search_shop: 'Search the shop', in_stock: 'available', sold_out: 'Sold out', add_to_bag: 'Add to bag',
  no_shop_products: 'No products match your search.', shop_footer: 'Everyday goods, thoughtfully made.', your_bag: 'Your bag', empty_bag: 'Your bag is empty.',
  checkout: 'Checkout', sign_in_checkout: 'Sign in to checkout', new_customer: 'New customer? Create an account', shipping_checkout: 'Shipping & checkout',
  items: 'items', placing_order: 'Placing order…', place_order: 'Place order', order_confirmed: 'Order confirmed', thank_you: 'Thank you for your order.',
  received_order: 'We’ve received order', continue_shopping: 'Continue shopping', shop_brand_note: 'Everyday goods',
  my_orders: 'My orders', my_orders_hint: 'Review your order history and follow each delivery step.', track_order: 'Track order',
  progress_ordered: 'Ordered', progress_preparing: 'Preparing', progress_shipped: 'Shipped', progress_delivered: 'Delivered',
  back_to_orders: 'Back to my orders', no_order_history: 'You have no order history yet.', order_cancelled: 'This order was cancelled.', ordered_on: 'Ordered on',
  marketplace_title: 'Marketplace integrations', marketplace_hint: 'Prepare every sales channel for centralized order management.',
  marketplace_demo_badge: 'Future feature · Demo preview', marketplace_hero_title: 'All marketplace orders, one clear workspace.',
  marketplace_hero_body: 'Shopee, Lazada, TikTok Shop, and Thaimart connections are planned. This preview shows how imported orders and channel health will appear once APIs are enabled.',
  connected_channels: 'Connected channels', mock_orders: 'Mock orders', awaiting_connection: 'Awaiting connection',
  channel_shopee_hint: 'Import orders, buyer details, shipping data, and parcel status from Shopee.',
  channel_lazada_hint: 'Centralize Lazada orders and keep fulfillment status aligned with your OMS.',
  channel_tiktok_hint: 'Bring TikTok Shop orders into the same packing and delivery workflow.',
  channel_thaimart_hint: 'Support a Thai marketplace channel and bring local seller orders into the OMS workflow.',
  order_sync: 'Order sync', stock_sync: 'Stock sync', status_sync: 'Status sync', connect_soon: 'Connection coming soon',
  marketplace_orders: 'Marketplace order preview', marketplace_orders_hint: 'Sample data demonstrating the future cross-channel workflow.',
  all_channels: 'All channels', marketplace_order_id: 'Marketplace order', channel: 'Channel', received_at: 'Received', demo_data: 'Demo data',
  demo_data_note: 'These orders are frontend-only samples. No marketplace account or API is connected yet.',
};

const th: typeof en = {
  language: 'ไทย', thai: 'ไทย', english: 'EN', welcome: 'ยินดีต้อนรับ', sign_in_store: 'เข้าสู่ระบบร้านค้าของคุณ',
  sign_in_hint: 'เข้าสู่ระบบเพื่อจัดการงานประจำวันของร้าน', choose_demo_account: 'เลือกผู้ใช้งานตัวอย่างเพื่อเข้าสู่ระบบได้ทันที', create_account: 'สร้างบัญชีใหม่',
  create_account_hint: 'บัญชีใหม่จะเริ่มต้นด้วยสิทธิ์ลูกค้า', first_name: 'ชื่อ', last_name: 'นามสกุล',
  email: 'อีเมล', password: 'รหัสผ่าน', please_wait: 'กรุณารอสักครู่…', sign_in: 'เข้าสู่ระบบ',
  new_here: 'ยังไม่มีบัญชี? สมัครสมาชิก', have_account: 'มีบัญชีแล้ว? เข้าสู่ระบบ', visit_store: 'ไปยังหน้าร้าน →',
  auth_hero_tag: 'จัดการทุกอย่างในที่เดียว', auth_hero_title: 'ระบบจัดการออเดอร์',
  auth_hero_body: 'พื้นที่ทำงานที่ช่วยให้สต็อกแม่นยำและทุกออเดอร์เดินหน้าอย่างราบรื่น',
  dashboard: 'ภาพรวม', orders: 'ออเดอร์', products: 'สินค้า', marketplace: 'มาร์เก็ตเพลส', sign_out: 'ออกจากระบบ', open_store: 'เปิดหน้าร้าน',
  morning: 'สวัสดี', dashboard_hint: 'นี่คือภาพรวมสิ่งที่กำลังเกิดขึ้นในร้านของคุณ', products_title: 'สินค้าและสต็อก',
  products_hint: 'จัดการแคตตาล็อกและสต็อกพร้อมขายให้ชัดเจน', orders_title: 'จัดการออเดอร์', orders_hint: 'สร้างและติดตามออเดอร์ได้ในที่เดียว',
  items_catalog: 'สินค้าในแคตตาล็อก', active_orders: 'ออเดอร์ที่กำลังดำเนินการ', waiting_complete: 'รอดำเนินการให้เสร็จ', low_stock: 'สินค้าใกล้หมด',
  needs_attention: 'ควรตรวจสอบ', order_value: 'มูลค่าออเดอร์', api_unavailable: 'API ไม่พร้อมใช้งาน', visible_orders: 'ออเดอร์ที่มองเห็น',
  recent_orders: 'ออเดอร์ล่าสุด', no_orders_dashboard: 'ยังไม่มีออเดอร์ สร้างออเดอร์แรกได้จากเมนูออเดอร์', quick_start: 'เริ่มต้นอย่างรวดเร็ว',
  workspace_live: 'ระบบของคุณพร้อมใช้งานแล้ว', workspace_body: 'เพิ่มสินค้า ตรวจสอบสต็อก และสร้างออเดอร์ได้จากเมนูด้านข้าง',
  api_docs: 'เปิดเอกสาร API →', product_inventory: 'สินค้าและคลัง', inventory_live: 'ข้อมูลสต็อกแบบเรียลไทม์จาก PostgreSQL',
  search_products: 'ค้นหาสินค้า', add_product: '+ เพิ่มสินค้า', product: 'สินค้า', sku: 'SKU', price: 'ราคา', available: 'พร้อมขาย',
  reserved: 'จองแล้ว', status: 'สถานะ', loading_inventory: 'กำลังโหลดสต็อก…', no_products: 'ไม่พบสินค้า', add_first_product: ' เพิ่มสินค้าแรกของคุณ',
  description: 'รายละเอียด', product_name: 'ชื่อสินค้า', short_description: 'รายละเอียดสินค้าแบบสั้น', price_thb: 'ราคา (บาท)',
  initial_quantity: 'จำนวนเริ่มต้น', cancel: 'ยกเลิก', saving: 'กำลังบันทึก…', create_product: 'สร้างสินค้า', active: 'ใช้งาน', inactive: 'ปิดใช้งาน',
  track_orders: 'สร้างและติดตามออเดอร์ลูกค้า', new_order: '+ สร้างออเดอร์', order: 'ออเดอร์', created: 'วันที่สร้าง', ship_to: 'จัดส่งถึง', total: 'รวม',
  loading_orders: 'กำลังโหลดออเดอร์…', no_orders: 'ยังไม่มีออเดอร์ สร้างออเดอร์แรกของคุณ', create_order: 'สร้างออเดอร์', order_item: 'รายการสินค้า',
  actions: 'ดำเนินการ', view_details: 'ดูรายละเอียด', order_details: 'รายละเอียดออเดอร์', customer: 'ลูกค้า', ordered_items: 'สินค้าที่สั่ง',
  quantity: 'จำนวน', unit_price: 'ราคาต่อชิ้น', subtotal: 'รวมย่อย', status_history: 'ประวัติสถานะ', changed_by: 'เปลี่ยนโดย',
  mark_shipped: 'จัดส่งแล้ว', mark_delivered: 'จัดส่งสำเร็จ', updating_status: 'กำลังอัปเดตสถานะ…', close: 'ปิด',
  select_product: 'เลือกสินค้า', shipping_address: 'ที่อยู่จัดส่ง', recipient_name: 'ชื่อผู้รับ', address_line: 'ที่อยู่', city: 'เมือง/เขต',
  postal_code: 'รหัสไปรษณีย์', country_code: 'รหัสประเทศ เช่น TH', creating: 'กำลังสร้าง…', role_admin: 'ผู้ดูแล', role_staff: 'พนักงาน', role_customer: 'ลูกค้า',
  status_pending: 'รอดำเนินการ', status_confirmed: 'ยืนยันแล้ว', status_processing: 'กำลังจัดเตรียม', status_shipped: 'จัดส่งแล้ว', status_delivered: 'ส่งสำเร็จ', status_cancelled: 'ยกเลิก',
  shop_new: 'สินค้าใหม่', shop_collection_link: 'คอลเลกชัน', manage_store: 'จัดการร้าน', hi: 'สวัสดี', bag: 'ถุงสินค้า',
  shop_tag: 'สตูดิโอคอลเลกชัน · 2026', shop_title_1: 'ของใช้เรียบง่าย', shop_title_2: 'ที่อยู่กับคุณได้นาน',
  shop_intro: 'ของใช้จำเป็นสำหรับการทำงาน การพักผ่อน และทุกช่วงเวลา ออกแบบอย่างเรียบง่าย ผลิตอย่างตั้งใจ', shop_cta: 'เลือกชมคอลเลกชัน ↓',
  featured: 'สินค้าแนะนำ', featured_title: 'สิ่งของสำหรับจังหวะชีวิตทุกวัน', featured_note: 'ผลิตจำนวนน้อย · คัดสรรวัสดุ', shop_all: 'สินค้าทั้งหมด',
  collection: 'คอลเลกชันของเรา', search_shop: 'ค้นหาในร้าน', in_stock: 'ชิ้นพร้อมขาย', sold_out: 'สินค้าหมด', add_to_bag: 'เพิ่มลงถุง',
  no_shop_products: 'ไม่พบสินค้าที่ค้นหา', shop_footer: 'ของใช้ทุกวันที่สร้างขึ้นอย่างตั้งใจ', your_bag: 'ถุงสินค้าของคุณ', empty_bag: 'ยังไม่มีสินค้าในถุง',
  checkout: 'ดำเนินการสั่งซื้อ', sign_in_checkout: 'เข้าสู่ระบบเพื่อสั่งซื้อ', new_customer: 'ลูกค้าใหม่? สมัครสมาชิก', shipping_checkout: 'จัดส่งและยืนยันคำสั่งซื้อ',
  items: 'ชิ้น', placing_order: 'กำลังส่งออเดอร์…', place_order: 'ยืนยันการสั่งซื้อ', order_confirmed: 'ยืนยันออเดอร์แล้ว', thank_you: 'ขอบคุณสำหรับคำสั่งซื้อ',
  received_order: 'เราได้รับออเดอร์', continue_shopping: 'เลือกซื้อสินค้าต่อ', shop_brand_note: 'ของใช้สำหรับทุกวัน',
  my_orders: 'ออเดอร์ของฉัน', my_orders_hint: 'ดูประวัติการสั่งซื้อและติดตามสถานะการจัดส่งของคุณ', track_order: 'ติดตามออเดอร์',
  progress_ordered: 'สั่งซื้อแล้ว', progress_preparing: 'กำลังเตรียม', progress_shipped: 'จัดส่งแล้ว', progress_delivered: 'ส่งสำเร็จ',
  back_to_orders: 'กลับไปออเดอร์ของฉัน', no_order_history: 'คุณยังไม่มีประวัติการสั่งซื้อ', order_cancelled: 'ออเดอร์นี้ถูกยกเลิก', ordered_on: 'สั่งซื้อเมื่อ',
  marketplace_title: 'เชื่อมต่อมาร์เก็ตเพลส', marketplace_hint: 'เตรียมทุกช่องทางขายให้พร้อมสำหรับการจัดการออเดอร์จากศูนย์กลาง',
  marketplace_demo_badge: 'ฟีเจอร์อนาคต · ตัวอย่างหน้าจอ', marketplace_hero_title: 'รวมออเดอร์ทุกมาร์เก็ตเพลสไว้ในที่เดียว',
  marketplace_hero_body: 'วางแผนรองรับ Shopee, Lazada, TikTok Shop และ Thaimart หน้านี้แสดงตัวอย่างออเดอร์และสถานะช่องทางก่อนเปิดใช้งาน API จริง',
  connected_channels: 'ช่องทางที่เชื่อมแล้ว', mock_orders: 'ออเดอร์ตัวอย่าง', awaiting_connection: 'รอการเชื่อมต่อ',
  channel_shopee_hint: 'นำเข้าออเดอร์ ข้อมูลผู้ซื้อ ที่อยู่จัดส่ง และสถานะพัสดุจาก Shopee',
  channel_lazada_hint: 'รวมออเดอร์ Lazada และซิงก์สถานะการจัดส่งกับระบบ OMS',
  channel_tiktok_hint: 'นำออเดอร์ TikTok Shop เข้าสู่ขั้นตอนแพ็กและจัดส่งเดียวกัน',
  channel_thaimart_hint: 'รองรับมาร์เก็ตเพลสสัญชาติไทย และนำออเดอร์ผู้ขายไทยเข้าสู่ workflow ของ OMS',
  order_sync: 'ซิงก์ออเดอร์', stock_sync: 'ซิงก์สต็อก', status_sync: 'ซิงก์สถานะ', connect_soon: 'เตรียมเปิดเชื่อมต่อ',
  marketplace_orders: 'ตัวอย่างออเดอร์มาร์เก็ตเพลส', marketplace_orders_hint: 'ข้อมูลตัวอย่างเพื่อแสดง workflow หลายช่องทางในอนาคต',
  all_channels: 'ทุกช่องทาง', marketplace_order_id: 'เลขออเดอร์มาร์เก็ตเพลส', channel: 'ช่องทาง', received_at: 'รับออเดอร์เมื่อ', demo_data: 'ข้อมูลตัวอย่าง',
  demo_data_note: 'ออเดอร์ทั้งหมดเป็นข้อมูลตัวอย่างบนหน้าบ้าน ยังไม่มีการเชื่อมบัญชีหรือ API ของมาร์เก็ตเพลสจริง',
};

export type TranslationKey = keyof typeof en;
type I18nContextValue = { language: Language; t: (key: TranslationKey) => string; toggle_language: () => void };
const I18nContext = createContext<I18nContextValue | null>(null);

function initial_language(): Language {
  const stored = localStorage.getItem('onlyarm_language');
  if (stored === 'en' || stored === 'th') return stored;
  return navigator.language.toLowerCase().startsWith('th') ? 'th' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, set_language] = useState<Language>(initial_language);
  const value = useMemo<I18nContextValue>(() => ({
    language,
    t: (key) => (language === 'th' ? th : en)[key],
    toggle_language: () => set_language((current) => {
      const next = current === 'en' ? 'th' : 'en';
      localStorage.setItem('onlyarm_language', next);
      document.documentElement.lang = next;
      return next;
    }),
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { language, toggle_language } = useI18n();
  return <button onClick={toggle_language} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition ${dark ? 'border-white/20 text-white hover:bg-white/10' : 'border-stone-300 bg-white hover:bg-stone-50'}`} aria-label="Switch language">{language === 'en' ? 'ไทย' : 'EN'}</button>;
}
