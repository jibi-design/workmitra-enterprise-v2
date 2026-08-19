/** Job Mitra | careerGateApi.service.ts | Facade — Career Employment Gate + apply/list API. */

export type {
  ServerCareerApplicationDto,
  ServerCareerEmploymentDto,
  ServerCareerPostDto,
} from "./careerGateApi.types";

export {
  hydrateCareerAppIdBridgeFromServer,
  isCareerApiSyncEnabled,
  mergeServerApplicationsIntoBridges,
  mustRollbackCareerLocalWrite,
  resolveCareerGateApplicationId,
  resolveCareerGatePostId,
  syncActorIdentityBridge,
} from "./careerGateApi.bridge";

export { careerGateApi } from "./careerGateApi.client";
