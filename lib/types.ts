import type { Prisma } from "./generated/prisma/client";

export type Label = Prisma.LabelGetPayload<{
  include: {
    options: {
      include: {
        relationsFrom: { include: { relatedOption: true } };
      };
    };
  };
}>;

export interface OptionSummary {
  id: string;
  name: string;
}

export interface RelationField {
  id: string;
  key: string;
}

export interface LabelGroup {
  id: string;
  name: string;
  options: { id: string; name: string }[];
}

export interface TableActionsProps {
  activityId: string;
  activityName: string;
}

export interface DataTableProjectsProps {
  bureauName: string;
  searchParams?: {
    page?: string;
    year?: string;
    semester?: string;
    stat?: string;
    sort?: string;
    project?: string;
    district?: string;
    mode?: string;
    status?: string;
    month?: string;
    search?: string;
    pageSize?: string;
  };
}

export interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
}

export interface ModeOfImplementationData {
  mode: string;
  count: number;
}

export interface TargetAccomplishmentData {
  indicator: string;
  semester: string;
  target: number;
  accomplished: number;
  projectName: string | null;
}

export interface Supply {
  id: string;
  name: string;
  size: string | null;
  category: { id: string; name: string } | null;
  stockQuantity: number;
  stockInDate: Date | null;
}

export interface OptionSummary {
  id: string;
  name: string;
}

export interface SupplyTableProps {
  supplies: Supply[];
  categoryOptions: OptionSummary[];
  currentSearch: string;
  currentCategory: string;
  currentPage: number;
  totalPages: number;
}

export type Option = Label["options"][number];
export type OptionRelation = Option["relationsFrom"][number];

export interface PropertyRecord {
  id: string;
  project: string | null;
  itemNo: string | null;
  classification: string | null;
  quantity: number;
  unit: string | null;
  descriptionModel: string | null;
  receivedFrom: string | null;
  propertyNumber: string | null;
  icsParNumber: string | null;
  serialNumber: string | null;
  dateAcquired: Date | null;
  accountableOfficer: string | null;
  unitCost: number;
  estimatedUsefulLife: string | null;
  receivedTransferred: string | null;
  remarks: string | null;
  createdAt: Date;
}

export interface ProcurementRecord {
  id: string;
  prNo: string | null;
  activityId: string | null;
  activityName: string | null;
  linkToFile: string | null;
  projectFundSource: string | null;
  typeOfItemsProcured: string | null;
  amount: number;
  nameOfSupplier: string | null;
  joPo: string | null;
  linkToAttachments: string | null;
  personnelInCharge: string | null;
  dateForwardedToRo: Date | null;
  transmittalReport: string | null;
  paymentStatus: string | null;
  remarks: string | null;
  createdAt: Date;
}

export interface Fw4aRecord {
  id: string;
  locality: string | null;
  barangay: string | null;
  district: string | null;
  locations: string | null;
  siteType: string | null;
  siteCode: string | null;
  strategy: string | null;
  status: string | null;
  reasonForOutage: string | null;
  remarks: string | null;
  createdAt: Date;
}
