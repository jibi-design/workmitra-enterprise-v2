import { apiService } from "../../../shared/services/apiService";
import { asServerApplication, asServerEmployment, asServerPost } from "./careerGateApi.parsers";
import { syncActorIdentityBridge } from "./careerGateApi.bridge";
import type { ApiEnvelope } from "./careerGateApi.types";
import {
  EMPLOYEE_CAREER,
  EMPLOYER_CAREER,
  type ServerCareerApplicationDto,
  type ServerCareerEmploymentDto,
  type ServerCareerPostDto,
} from "./careerGateApi.types";

export const careerGateApi = {
  async listMyCareerPosts(): Promise<ServerCareerPostDto[]> {
    syncActorIdentityBridge("employer");
    const res = await apiService.get<ApiEnvelope<{ posts: unknown }>>(`${EMPLOYER_CAREER}/jobs`);
    const raw = res.data.posts;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerPost).filter((item): item is ServerCareerPostDto => item !== null);
  },

  async createCareerPost(body: Record<string, unknown>): Promise<ServerCareerPostDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.post<ApiEnvelope<{ post: unknown }>>(
      `${EMPLOYER_CAREER}/jobs`,
      body,
    );
    const post = asServerPost(res.data.post);
    if (!post) {
      throw new Error("Invalid create post response: missing post UUID");
    }
    return post;
  },

  async updateCareerPost(
    postId: string,
    body: Record<string, unknown>,
  ): Promise<ServerCareerPostDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.patch<ApiEnvelope<{ post: unknown }>>(
      `${EMPLOYER_CAREER}/jobs/${postId}`,
      body,
    );
    const post = asServerPost(res.data.post);
    if (!post) {
      throw new Error("Invalid update post response: missing post UUID");
    }
    return post;
  },

  async deleteCareerPost(postId: string): Promise<void> {
    syncActorIdentityBridge("employer");
    await apiService.delete<ApiEnvelope<{ deleted: boolean }>>(`${EMPLOYER_CAREER}/jobs/${postId}`);
  },

  async applyToJob(
    postId: string,
    body: { cover_note?: string } = {},
  ): Promise<ServerCareerApplicationDto> {
    syncActorIdentityBridge("employee");
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_CAREER}/jobs/${postId}/apply`,
      body,
    );
    const application = asServerApplication(res.data.application);
    if (!application) {
      throw new Error("Invalid apply response: missing application UUID");
    }
    return application;
  },

  async listMyApplications(): Promise<ServerCareerApplicationDto[]> {
    syncActorIdentityBridge("employee");
    const res = await apiService.get<ApiEnvelope<{ applications: unknown }>>(
      `${EMPLOYEE_CAREER}/applications`,
    );
    const raw = res.data.applications;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(asServerApplication)
      .filter((item): item is ServerCareerApplicationDto => item !== null);
  },

  async issueOffer(
    applicationId: string,
    body: { terms?: Record<string, unknown>; expires_at?: string } = {},
  ): Promise<unknown> {
    syncActorIdentityBridge("employer");
    const res = await apiService.post<ApiEnvelope<{ offer: unknown }>>(
      `${EMPLOYER_CAREER}/applications/${applicationId}/offer`,
      body,
    );
    return res.data.offer;
  },

  async confirmHire(
    applicationId: string,
    body: { details?: Record<string, unknown> } = {},
  ): Promise<{ employment: ServerCareerEmploymentDto; alreadyConfirmed?: boolean }> {
    syncActorIdentityBridge("employer");
    const res = await apiService.post<
      ApiEnvelope<{ employment: unknown; alreadyConfirmed?: boolean }>
    >(`${EMPLOYER_CAREER}/applications/${applicationId}/confirm-hire`, body);
    const employment = asServerEmployment(res.data.employment);
    if (!employment) {
      throw new Error("Invalid confirm-hire response: missing employment");
    }
    return {
      employment,
      alreadyConfirmed: res.data.alreadyConfirmed === true,
    };
  },

  async listMyEmployments(): Promise<ServerCareerEmploymentDto[]> {
    syncActorIdentityBridge("employee");
    const res = await apiService.get<ApiEnvelope<{ employments: unknown }>>(
      `${EMPLOYEE_CAREER}/employments`,
    );
    const raw = res.data.employments;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(asServerEmployment)
      .filter((item): item is ServerCareerEmploymentDto => item !== null);
  },

  async listEmployerStaffEmployments(): Promise<ServerCareerEmploymentDto[]> {
    syncActorIdentityBridge("employer");
    const res = await apiService.get<ApiEnvelope<{ employments: unknown }>>(
      `${EMPLOYER_CAREER}/staff`,
    );
    const raw = res.data.employments;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(asServerEmployment)
      .filter((item): item is ServerCareerEmploymentDto => item !== null);
  },

  async patchEmployeeEmployment(
    employmentId: string,
    body: { status?: string; details?: Record<string, unknown> },
  ): Promise<ServerCareerEmploymentDto> {
    syncActorIdentityBridge("employee");
    const res = await apiService.patch<ApiEnvelope<{ employment: unknown }>>(
      `${EMPLOYEE_CAREER}/employments/${encodeURIComponent(employmentId)}`,
      body,
    );
    const employment = asServerEmployment(res.data.employment);
    if (!employment) throw new Error("Invalid employment patch response");
    return employment;
  },

  async patchEmployerEmployment(
    employmentId: string,
    body: { status?: string; details?: Record<string, unknown> },
  ): Promise<ServerCareerEmploymentDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.patch<ApiEnvelope<{ employment: unknown }>>(
      `${EMPLOYER_CAREER}/employments/${encodeURIComponent(employmentId)}`,
      body,
    );
    const employment = asServerEmployment(res.data.employment);
    if (!employment) throw new Error("Invalid employment patch response");
    return employment;
  },

  async acceptOffer(applicationId: string): Promise<unknown> {
    syncActorIdentityBridge("employee");
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_CAREER}/applications/${applicationId}/offer/accept`,
      {},
    );
    return res.data.application;
  },

  async declineOffer(applicationId: string): Promise<unknown> {
    syncActorIdentityBridge("employee");
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_CAREER}/applications/${applicationId}/offer/decline`,
      {},
    );
    return res.data.application;
  },

  async listPublishedJobs(): Promise<ServerCareerPostDto[]> {
    syncActorIdentityBridge("employee");
    const res = await apiService.get<ApiEnvelope<{ posts: unknown }>>(`${EMPLOYEE_CAREER}/jobs`);
    const raw = res.data.posts;
    if (!Array.isArray(raw)) return [];
    return raw.map(asServerPost).filter((item): item is ServerCareerPostDto => item !== null);
  },

  async getMyApplication(applicationId: string): Promise<ServerCareerApplicationDto> {
    syncActorIdentityBridge("employee");
    const res = await apiService.get<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYEE_CAREER}/applications/${encodeURIComponent(applicationId)}`,
    );
    const application = asServerApplication(res.data.application);
    if (!application) throw new Error("Invalid application response");
    return application;
  },

  async listApplicationsForPost(postId: string): Promise<ServerCareerApplicationDto[]> {
    syncActorIdentityBridge("employer");
    const res = await apiService.get<ApiEnvelope<{ applications: unknown }>>(
      `${EMPLOYER_CAREER}/jobs/${encodeURIComponent(postId)}/applications`,
    );
    const raw = res.data.applications;
    if (!Array.isArray(raw)) return [];
    return raw
      .map(asServerApplication)
      .filter((item): item is ServerCareerApplicationDto => item !== null);
  },

  async getApplicationForPost(
    postId: string,
    applicationId: string,
  ): Promise<ServerCareerApplicationDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.get<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYER_CAREER}/jobs/${encodeURIComponent(postId)}/applications/${encodeURIComponent(applicationId)}`,
    );
    const application = asServerApplication(res.data.application);
    if (!application) throw new Error("Invalid application response");
    return application;
  },

  async updateApplicationStatus(
    postId: string,
    applicationId: string,
    status: string,
  ): Promise<ServerCareerApplicationDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.patch<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYER_CAREER}/jobs/${encodeURIComponent(postId)}/applications/${encodeURIComponent(applicationId)}/status`,
      { status },
    );
    const application = asServerApplication(res.data.application);
    if (!application) throw new Error("Invalid application status response");
    return application;
  },

  async shortlistApplication(applicationId: string): Promise<ServerCareerApplicationDto> {
    syncActorIdentityBridge("employer");
    const res = await apiService.post<ApiEnvelope<{ application: unknown }>>(
      `${EMPLOYER_CAREER}/applications/${encodeURIComponent(applicationId)}/shortlist`,
      {},
    );
    const application = asServerApplication(res.data.application);
    if (!application) throw new Error("Invalid shortlist response");
    return application;
  },
};
