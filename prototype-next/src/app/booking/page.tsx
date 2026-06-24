"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, Camera, CheckCircle2, Clock3, MapPin, Phone, ShoppingBag, UserRound } from "lucide-react";
import { calculateSlotAvailability, filterBookingSlots, filterSlotsByDate, getFirstAvailableSlotIndex, reserveSlot } from "@/domain/booking";

type BookingOptions = {
  brand: { id: string; name: string };
  stores: Array<{ id: string; name: string }>;
  serviceGroups: Array<{ id: string; name: string; slotMinutes: number; capacityPerSlot: number }>;
  products: Array<{ id: string; serviceGroupId: string | null; name: string; priceCents: number; type: string }>;
  slots: Array<{ id: string; storeId: string; serviceGroupId: string; startsAt: string; endsAt: string; capacity: number; bookedCount: number }>;
};

const fallbackDate = "2026-06-01";
const fallbackStartAt = "2026-06-01T10:00:00";
const fallbackEndAt = "2026-06-01T10:30:00";

const fallbackBookingOptions: BookingOptions = {
  brand: { id: "seed-brand-id", name: "一悦照相馆" },
  stores: [{ id: "seed-store-id", name: "威海智慧谷店" }],
  serviceGroups: [{ id: "seed-service-group-id", name: "证件照预约", slotMinutes: 30, capacityPerSlot: 2 }],
  products: [{ id: "seed-product-id", serviceGroupId: "seed-service-group-id", name: "团购预约-定金20到店退", priceCents: 2000, type: "SERVICE" }],
  slots: [
    {
      id: "seed-slot-id",
      storeId: "seed-store-id",
      serviceGroupId: "seed-service-group-id",
      startsAt: fallbackStartAt,
      endsAt: fallbackEndAt,
      capacity: 2,
      bookedCount: 0
    }
  ]
};

export default function BookingPage() {
  const [storeId, setStoreId] = useState(fallbackBookingOptions.stores[0].id);
  const [serviceGroupId, setServiceGroupId] = useState(fallbackBookingOptions.serviceGroups[0].id);
  const [selectedDate, setSelectedDate] = useState(fallbackDate);
  const [slotIndex, setSlotIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; orderNo?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState<BookingOptions>(fallbackBookingOptions);

  useEffect(() => {
    let ignore = false;

    fetch("/api/booking-options")
      .then((response) => response.json())
      .then((body: { ok: boolean; options: BookingOptions | null }) => {
        if (!ignore && body.ok && body.options) {
          setOptions(body.options);
          setStoreId(body.options.stores[0]?.id ?? "");
          setServiceGroupId(body.options.serviceGroups[0]?.id ?? "");
          setSelectedDate(body.options.slots[0]?.startsAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
        }
      })
      .catch(() => {
        // Keep the local fallback so the page remains usable before the database is started.
      });

    return () => {
      ignore = true;
    };
  }, []);

  const activeStore = options.stores.find((store) => store.id === storeId);
  const activeServiceGroup = options.serviceGroups.find((group) => group.id === serviceGroupId);

  const availableDates = useMemo(() => {
    return Array.from(new Set(options.slots.map((slot) => slot.startsAt.slice(0, 10))));
  }, [options.slots]);

  const filteredSlots = useMemo(() => {
    return filterSlotsByDate(filterBookingSlots(options.slots, storeId, serviceGroupId), selectedDate);
  }, [options.slots, selectedDate, serviceGroupId, storeId]);

  const filteredProducts = useMemo(() => {
    const matched = options.products.filter((product) => !serviceGroupId || !product.serviceGroupId || product.serviceGroupId === serviceGroupId);
    return matched.length ? matched : options.products;
  }, [options.products, serviceGroupId]);

  const firstAvailableSlotIndex = getFirstAvailableSlotIndex(filteredSlots);
  const effectiveSlotIndex = filteredSlots[slotIndex] ? slotIndex : Math.max(firstAvailableSlotIndex, 0);
  const selectedSlot = filteredSlots[effectiveSlotIndex];
  const selectedProduct = filteredProducts[productIndex] ?? fallbackBookingOptions.products[0];

  const availability = useMemo(() => {
    if (!selectedSlot) {
      return { capacity: 0, used: 0, remaining: 0, isAvailable: false };
    }
    return calculateSlotAvailability({
      capacity: selectedSlot.capacity,
      bookedCount: selectedSlot.bookedCount,
      cancelledCount: 0
    });
  }, [selectedSlot]);

  async function handleBooking() {
    try {
      if (!selectedSlot) {
        setResult({ ok: false, message: "当天暂无可预约时段" });
        return;
      }
      if (!customerName.trim() || !customerPhone.trim()) {
        setResult({ ok: false, message: "请填写客户姓名和手机号" });
        return;
      }

      reserveSlot({ capacity: selectedSlot.capacity, bookedCount: selectedSlot.bookedCount, cancelledCount: 0 });
      setSubmitting(true);
      setResult(null);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: options.brand.id,
          storeId: selectedSlot.storeId,
          serviceGroupId: selectedSlot.serviceGroupId,
          slotId: selectedSlot.id,
          productIds: [selectedProduct.id],
          source: selectedProduct.type === "DOUYIN" ? "DOUYIN" : selectedProduct.type === "MEITUAN" ? "MEITUAN" : "ONLINE",
          bookingMethod: "ONLINE",
          customerName,
          customerPhone,
          remark: "预约端提交"
        })
      });
      const body = (await response.json()) as { ok: boolean; order?: { orderNo: string }; message?: string };
      setResult(body.ok && body.order ? { ok: true, message: "预约已提交", orderNo: body.order.orderNo } : { ok: false, message: body.message ?? "预约提交失败" });
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "预约失败" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2f6f8] pb-28 text-slate-900 lg:pb-10">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{options.brand.name}</h1>
              <p className="text-sm text-slate-500">{activeStore?.name ?? "默认门店"} · 在线预约</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500 sm:w-[360px]">
            {["选服务", "选时段", "留联系方式"].map((step, index) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-900">0{index + 1}</span>
                <span className="ml-1">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <StepTitle index="01" title="选择服务和商品" desc="先确认门店、拍摄类型和本次预约商品。" />
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                门店
                <select
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                  value={storeId}
                  onChange={(event) => {
                    setStoreId(event.target.value);
                    setSlotIndex(0);
                  }}
                >
                  {options.stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                服务
                <select
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                  value={serviceGroupId}
                  onChange={(event) => {
                    setServiceGroupId(event.target.value);
                    setSlotIndex(0);
                    setProductIndex(0);
                  }}
                >
                  {options.serviceGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filteredProducts.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  className={
                    index === productIndex
                      ? "rounded-lg border border-slate-950 bg-slate-950 p-4 text-left text-white"
                      : "rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-teal-700"
                  }
                  onClick={() => setProductIndex(index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{product.name}</div>
                      <div className={index === productIndex ? "mt-2 text-xs text-slate-300" : "mt-2 text-xs text-slate-500"}>{product.type} · {activeServiceGroup?.slotMinutes ?? 30} 分钟</div>
                    </div>
                    <ShoppingBag className="h-4 w-4 flex-none" />
                  </div>
                  <div className="mt-4 text-lg font-semibold">¥{formatPrice(product.priceCents)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <StepTitle index="02" title="选择日期和时段" desc="可约时段按当前门店和服务过滤，满员时自动禁用。" />
            <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <label className="block text-sm font-semibold text-slate-700">
                预约日期
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 px-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                  type="date"
                  min={availableDates[0]}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSlotIndex(0);
                  }}
                />
              </label>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">快捷日期</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(availableDates.length ? availableDates : [selectedDate]).slice(0, 6).map((date) => (
                    <button
                      key={date}
                      type="button"
                      className={
                        date === selectedDate
                          ? "min-h-12 rounded-lg border border-teal-700 bg-teal-50 px-3 text-left text-sm font-semibold text-teal-800"
                          : "min-h-12 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-700"
                      }
                      onClick={() => {
                        setSelectedDate(date);
                        setSlotIndex(0);
                      }}
                    >
                      {formatDateLabel(date)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSlots.length ? (
                filteredSlots.map((slot, index) => {
                  const slotAvailability = calculateSlotAvailability({ capacity: slot.capacity, bookedCount: slot.bookedCount, cancelledCount: 0 });
                  const selected = index === effectiveSlotIndex;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={
                        selected
                          ? "min-h-20 rounded-lg border border-slate-950 bg-slate-950 p-4 text-left text-white"
                          : "min-h-20 rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-900 transition hover:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      }
                      disabled={!slotAvailability.isAvailable}
                      onClick={() => setSlotIndex(index)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{formatTimeRange(slot.startsAt, slot.endsAt)}</span>
                        <Clock3 className="h-4 w-4 flex-none" />
                      </div>
                      <div className={selected ? "mt-3 text-xs text-slate-300" : "mt-3 text-xs text-slate-500"}>
                        可约 {slotAvailability.remaining}/{slot.capacity}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">当天暂无可预约时段，请切换日期或联系门店。</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <StepTitle index="03" title="填写联系人" desc="只用于本次预约确认和到店提醒。" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                客户姓名
                <span className="mt-2 flex min-h-12 items-center rounded-lg border border-slate-200 px-3 transition focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15">
                  <UserRound className="mr-2 h-4 w-4 flex-none text-slate-400" />
                  <input
                    autoComplete="name"
                    className="h-11 w-full bg-transparent text-base outline-none"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </span>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                手机号
                <span className="mt-2 flex min-h-12 items-center rounded-lg border border-slate-200 px-3 transition focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15">
                  <Phone className="mr-2 h-4 w-4 flex-none text-slate-400" />
                  <input
                    autoComplete="tel"
                    className="h-11 w-full bg-transparent text-base outline-none"
                    inputMode="tel"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                  />
                </span>
              </label>
            </div>
            <button
              className="mt-5 hidden min-h-12 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex lg:items-center"
              disabled={submitting || !availability.isAvailable}
              onClick={handleBooking}
            >
              {submitting ? "提交中" : "提交预约"}
            </button>
            <button
              className="mt-5 min-h-12 w-full rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
              disabled={submitting || !availability.isAvailable}
              onClick={handleBooking}
            >
              {submitting ? "提交中" : "提交预约"}
            </button>
            {result ? <ResultMessage result={result} /> : null}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="text-sm font-semibold text-slate-500">预约摘要</div>
          <div className="mt-5 space-y-4">
            <SummaryItem icon={<MapPin className="h-4 w-4" />} label="门店" value={activeStore?.name ?? "默认门店"} />
            <SummaryItem icon={<Camera className="h-4 w-4" />} label="服务" value={activeServiceGroup?.name ?? "默认服务组"} />
            <SummaryItem icon={<ShoppingBag className="h-4 w-4" />} label="商品" value={`${selectedProduct.name} / ¥${formatPrice(selectedProduct.priceCents)}`} />
            <SummaryItem icon={<CalendarDays className="h-4 w-4" />} label="日期" value={formatDateLabel(selectedDate)} />
            <SummaryItem icon={<Clock3 className="h-4 w-4" />} label="时段" value={selectedSlot ? formatTimeRange(selectedSlot.startsAt, selectedSlot.endsAt) : "暂无可约时段"} />
          </div>
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            当前时段剩余 <strong className="text-slate-950">{availability.remaining}</strong> 个名额，提交后由门店确认。
          </div>
        </aside>
      </div>

      {customerName || customerPhone ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-950">{selectedProduct.name}</div>
              <div className="mt-1 text-xs text-slate-500">{selectedSlot ? formatTimeRange(selectedSlot.startsAt, selectedSlot.endsAt) : "暂无可约时段"}</div>
            </div>
            <button
              className="min-h-12 flex-none rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || !availability.isAvailable}
              onClick={handleBooking}
            >
              {submitting ? "提交中" : "提交预约"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StepTitle({ index, title, desc }: { index: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">{index}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-teal-700">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function ResultMessage({ result, compact = false }: { result: { ok: boolean; message: string; orderNo?: string }; compact?: boolean }) {
  return (
    <div className={result.ok ? `${compact ? "mt-4" : "mt-5"} rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800` : `${compact ? "mt-4" : "mt-5"} rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700`}>
      <div className="flex items-center gap-2 font-semibold">
        {result.ok ? <CheckCircle2 className="h-4 w-4 flex-none" /> : null}
        <span>{result.message}</span>
      </div>
      {result.orderNo ? <p className="mt-2 text-base font-semibold">{result.orderNo}</p> : null}
    </div>
  );
}

function formatTimeRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${formatter.format(new Date(start))}-${formatter.format(new Date(end))}`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).format(new Date(`${value}T00:00:00`));
}

function formatPrice(value: number) {
  return (value / 100).toFixed(value % 100 === 0 ? 0 : 2);
}
