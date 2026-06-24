export type StaffDraftInput = {
  storeId?: string | null;
  name?: string | null;
  phone?: string | null;
  position?: string | null;
  enabled?: boolean;
};

export type StaffDraft = {
  storeId: string | null;
  name: string;
  phone: string | null;
  position: string | null;
  enabled: boolean;
};

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export function createStaffDraft(input: StaffDraftInput): StaffDraft {
  const name = input.name?.trim() ?? "";

  if (!name) {
    throw new Error("请填写员工姓名");
  }

  return {
    storeId: normalizeOptionalText(input.storeId),
    name,
    phone: normalizeOptionalText(input.phone),
    position: normalizeOptionalText(input.position),
    enabled: input.enabled ?? true
  };
}

export function updateStaffDraft(input: StaffDraftInput): Partial<StaffDraft> {
  const draft: Partial<StaffDraft> = {};

  if (input.storeId !== undefined) {
    draft.storeId = normalizeOptionalText(input.storeId);
  }

  if (input.name !== undefined) {
    const name = input.name?.trim() ?? "";
    if (!name) {
      throw new Error("请填写员工姓名");
    }
    draft.name = name;
  }

  if (input.phone !== undefined) {
    draft.phone = normalizeOptionalText(input.phone);
  }

  if (input.position !== undefined) {
    draft.position = normalizeOptionalText(input.position);
  }

  if (input.enabled !== undefined) {
    draft.enabled = input.enabled;
  }

  return draft;
}

export function assertStaffCanBeDeleted({ orderCount }: { orderCount: number }) {
  if (orderCount > 0) {
    throw new Error("员工已有订单，不能删除，请停用");
  }
}
