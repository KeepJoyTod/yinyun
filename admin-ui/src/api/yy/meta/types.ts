export interface PriorityFeatureVO {
  code: string;
  module: string;
  feature: string;
  priority: string;
  status: string;
  backendTarget: string;
  frontendTarget: string;
  note: string;
}

export interface EnterpriseModuleVO {
  code: string;
  stage: string;
  module: string;
  priority: string;
  status: string;
  frontendPath: string;
  dataModel: string;
  scope: string;
  dependencies: string;
  nextAction: string;
}
