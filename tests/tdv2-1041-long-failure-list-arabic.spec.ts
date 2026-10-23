import { test, expect } from '@playwright/test';

// TDV2-1041 / TDV2-1053 — oversized failure list with NON-LATIN (Arabic) titles.
//
// Companion to tdv2-1041-long-failure-list.spec.ts. GitHub counts the check
// *text* in characters but the *summary* in bytes, and the fix (INT-050) caps
// the failure list at 65,535 UTF-8 bytes. Arabic code points are ~2 bytes each,
// so an all-Arabic run should list FEWER failures before the
// "Truncated: too many results to list. View the full run" line than the
// English run does — that byte-vs-char contrast is the point of this variant.
//
//   - 500 tests, every one FAILS, one attempt each (retries disabled).
//   - Each title is a unique, long Arabic sentence; the Latin index keeps the
//     titles unique and sortable without changing the non-Latin nature.
//
// Imports from '@playwright/test' — the @testdino/playwright 2.10.2 reporter
// no longer re-exports test/expect.

const TOTAL = 500;

const subjects = [
  'عربة التسوق',
  'صفحة قائمة المنتجات',
  'ملخص عملية الدفع',
  'لوحة حساب العميل',
  'بريد تأكيد الطلب',
  'لوحة طرق الدفع المحفوظة',
  'حقل قسيمة الخصم الترويجية',
  'درج قائمة الرغبات',
  'شبكة نتائج البحث',
  'شارة توفر المخزون',
];

const actions = [
  'يجب أن يعيد حساب الإجمالي الكلي والضرائب المطبقة ورسوم الشحن التقديرية بشكل صحيح',
  'يجب أن يحافظ على العملة واللغة المختارة عبر إعادة تحميل الصفحة بالكامل والرجوع للخلف',
  'يجب أن يعرض رسالة خطأ واضحة تحدد الحقل الذي فشل في التحقق من جانب الخادم',
  'يجب أن يستعيد الخصم المطبق مسبقًا بعد أن يعدّل العميل عنوان التسليم',
  'يجب أن يحافظ على ترتيب جميع العناصر بعد أن يغيّر العميل تفضيل الفرز',
  'يجب أن يُظهر إشعار نفاد المخزون الصحيح قبل أن يُسمح للعميل بالوصول إلى صفحة الدفع',
  'يجب أن يزامن عدد الشارة مع جلسة الخادم ضمن نافذة إعادة المحاولة المحددة',
  'يجب أن يمنع الإرسال المزدوج عند النقر على زر التأكيد مرتين بسرعة متتالية',
  'يجب أن يقرّب كل قيمة نقدية إلى منزلتين عشريتين وفق قاعدة التقريب الافتراضية للمتجر',
  'يجب أن يعود إلى تقدير المستودع الرئيسي عندما يكون التقدير الإقليمي غير متاح',
];

const conditions = [
  'بعد أن يزيل العميل عنصرًا مخفّضًا ثم يعيد تطبيق رمز قسيمة العرض الترويجي',
  'عندما يكون المتصفح مقيّدًا باتصال ثلاثي الجيل بطيء ورمز الجلسة قريب من انتهاء الصلاحية',
  'بينما يتم دفع تحديث سعر متزامن من خدمة الكتالوج في الخلفية',
  'بمجرد ترقية الدفع كضيف إلى حساب مسجّل في منتصف عملية الدفع',
  'بمجرد أن تبلّغ خدمة المخزون عن حجز جزئي للكمية المطلوبة',
  'رغم أن مستوى برنامج الولاء تغيّر بين إضافة العنصر والوصول إلى الدفع',
  'في سيناريو الشحن المقسّم حيث يُرسَل عنصران من مركزَي تنفيذ مختلفين',
  'في الحالة الحدية التي تغطي فيها بطاقة الهدية إجمالي الطلب بالكامل بما في ذلك الشحن',
  'عندما يبدّل العميل بلد التسليم بعد عرض سعر شامل للضريبة بالفعل',
  'رغم إعادة عرض أداة التوصيات عدة مرات أثناء الترطيب الأولي للصفحة',
];

const makeTitle = (i: number) => {
  const subject = subjects[i % subjects.length];
  const action = actions[(i * 3) % actions.length];
  const condition = conditions[(i * 7) % conditions.length];
  return `اختبار الدفع ${String(i).padStart(4, '0')}: ${subject} ${action} ${condition}`;
};

test.describe('tdv2-1041 oversized failure list (Arabic)', () => {
  test.describe.configure({ retries: 0 });

  for (let i = 0; i < TOTAL; i++) {
    test(makeTitle(i), async () => {
      expect(`القيمة-الملاحَظة-${i}`).toBe(`القيمة-المتوقعة-${i}`);
    });
  }
});
