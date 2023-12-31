import supertest from "supertest";
import { app } from "../src/app";
import sequelize from "../src/models/sequelize";
import FamilyMember from "../src/models/FamilyMember";
import Family from "../src/models/Family";
import { Request, Response } from "express";
import {
  httpAddMemberNeedsHandler,
  httpDeleteMemberNeedsHandler,
  httpEditMemberNeedsHandler,
  httpGetAllMembersNeedsHandler,
  httpGetSpecificMemberNeedsHandler,
} from "../src/controllers/memberNeeds.controller";
import MemberNeeds from "../src/models/MemberNeeds";

const request = supertest(app);

const mockRequestFamilyBody = {
  id: 1,
  houseCondition: "string",
  notes: "string",
  familyCategory: "Orphans",
  members: [
    {
      id: 1,
      FamilyId: 1,
      firstName: "DDDDD",
      lastName: "DDDDD",
      gender: "Male",
      maritalStatus: "Single",
      address: "DDDDDDDDDDDDDDDDDDD",
      email: "DDDDD@DDsdwDDD.gmail",
      dateOfBirth: "12/12/2022",
      phoneNumber: "3243424322",
      isWorking: true,
      isPersonCharge: false,
      proficient: "dddddddddd",
      totalIncome: 3444,
      educationLevel: "ddddddd",
    },
    {
      id: 2,
      FamilyId: 1,
      firstName: "DDDDD",
      lastName: "DDDDD",
      gender: "Male",
      maritalStatus: "Single",
      address: "DDDDDDDDDDDDDDDDDDD",
      email: "ertgvcf@DDsdwDDD.gmail",
      dateOfBirth: "12/12/2022",
      phoneNumber: "3243424322",
      isWorking: true,
      isPersonCharge: true,
      proficient: "dddddddddd",
      totalIncome: 3444,
      educationLevel: "ddddddd",
    },
  ],
};
const firstMockRequestNeedBody = {
  id: 1,
  needName: "needName",
  MemberPriority: 1,
};

const secondMockRequestNeedBody = {
  id: 2,
  needName: "needName",
  MemberPriority: 1,
};

const updatedMockRequestBody = {
  MemberPriority: 3,
};

beforeAll(async () => {
  await sequelize.sync();
  await Family.destroy({ where: {} });
  await FamilyMember.destroy({ where: {} });
  await MemberNeeds.destroy({ where: {} });
});

afterAll(async () => {
  await Family.destroy({ where: {} });
  await FamilyMember.destroy({ where: {} });
  await MemberNeeds.destroy({ where: {} });
  await sequelize.close();
});

describe("httpAddMemberNeedsHandler", () => {
  it("should add a new Member Needs and return a success response", async () => {
    await request.post("/api/family").send(mockRequestFamilyBody);

    const res = await request
      .post(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
      )
      .send(firstMockRequestNeedBody);

    expect(res.status).toEqual(201);
    expect(res.body.message).toEqual("Member Need added successfully");
    expect(res.body.memberNeeds).toBeDefined();
  });

  it("should return 500 and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as unknown as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await httpAddMemberNeedsHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to add Member Needs",
    });
  });

  it("should return 404 and an error message if the provided family ID is invalid", async () => {
    const res = await request.post(
      `/api/member-needs/1245/${mockRequestFamilyBody.members[0].id}`
    );

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Failed to retrieve Family");
    expect(res.body.FamilyMember).toBeUndefined();
  });

  it("should return 404 and an error message if the provided family Member ID is invalid", async () => {
    await Family.destroy({ where: {} });
    await request.post("/api/family").send(mockRequestFamilyBody);

    const res = await request.post(
      `/api/member-needs/${mockRequestFamilyBody.id}/12345678`
    );

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Failed to retrieve family Member");
    expect(res.body.FamilyMember).toBeUndefined();
  });
});

describe("httpGetSpecificMemberNeedsHandler", () => {
  it("should return a Member Needs when a valid family ID and family Member Id are provided", async () => {
    await request.post("/api/family").send(mockRequestFamilyBody);

    await request
      .post(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
      )
      .send(firstMockRequestNeedBody);

    const response = await request.get(
      `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.familyMemberNeeds).toBeDefined();
  });

  it("should return 500 and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await httpGetSpecificMemberNeedsHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to retrieve member Needs",
    });
  });

  it("should return 404 and an error message if the provided family ID is invalid", async () => {
    const res = await request.get(
      `/api/member-needs/1234567/${mockRequestFamilyBody.members[0].id}`
    );

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Failed to retrieve Family");
    expect(res.body.FamilyMember).toBeUndefined();
  });

  it("should return 404 and an error message if the provided family Member ID is invalid", async () => {
    await FamilyMember.destroy({ where: {} });
    await request.post("/api/family").send(mockRequestFamilyBody);
    const res = await request.get(
      `/api/member-needs/${mockRequestFamilyBody.id}/9876545`
    );

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Failed to retrieve family Member");
    expect(res.body.FamilyMember).toBeUndefined();
  });
});

describe("httpEditMemberNeedsHandler", () => {
  it("should update the family and return a success response", async () => {
    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
    await MemberNeeds.destroy({ where: {} });
    await request.post("/api/family").send(mockRequestFamilyBody);

    await request
      .post(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
      )
      .send(firstMockRequestNeedBody);

    const response = await request
      .put(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}/${firstMockRequestNeedBody.id}`
      )
      .send(updatedMockRequestBody);

    // expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Family member Needs updated successfully"
    );

    const updatedMemberNeed = await MemberNeeds.findOne({
      where: {
        id: firstMockRequestNeedBody.id,
        FamilyId: mockRequestFamilyBody.id,
        familyMemberId: mockRequestFamilyBody.members[0].id,
      },
    });
    if (updatedMemberNeed) {
      expect(updatedMemberNeed.MemberPriority).toBe(3);
      expect(updatedMemberNeed.id).toBe(firstMockRequestNeedBody.id);
    }
    const updatedFamilyMember = await request.get(
      `/api/family-member/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
    );

    if (updatedFamilyMember) {
      expect(updatedFamilyMember.body.familyMember).toBeDefined();
      expect(updatedFamilyMember.body.familyMember.id).toBe(
        mockRequestFamilyBody.members[0].id
      );
      expect(updatedFamilyMember.body.familyMember.FamilyId).toBe(
        mockRequestFamilyBody.id
      );
    }
  });

  it("should return a 200 status code if invalid family ID provided", async () => {
    const response = await request
      .put(
        `/api/member-needs/658/${mockRequestFamilyBody.members[0].id}/${firstMockRequestNeedBody.id}`
      )
      .send(updatedMockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("There are No Records Were Updated");
  });

  it("should return a 200 status code if invalid family member ID provided", async () => {
    const response = await request
      .put(
        `/api/member-needs/${mockRequestFamilyBody.id}/11112/${firstMockRequestNeedBody.id}`
      )
      .send(updatedMockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("There are No Records Were Updated");
  });

  it("should return a 200 status code if invalid member needs ID provided", async () => {
    const response = await request
      .put(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}/11112`
      )
      .send(updatedMockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("There are No Records Were Updated");
  });

  it("should return a 500 status code and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest
      .spyOn(MemberNeeds, "update")
      .mockRejectedValue(new Error("Test error"));

    await httpEditMemberNeedsHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to edit family member Needs",
    });
  });
});

describe("httpDeleteMemberNeedsHandler", () => {
  it("should delete the Member Needs and return a success response", async () => {
    await request.post("/api/family").send(mockRequestFamilyBody);
    await request
      .post(`/api/family-member/${mockRequestFamilyBody.id}`)
      .send(mockRequestFamilyBody);

    await request
      .post(
        `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
      )
      .send(firstMockRequestNeedBody);
    const response = await request.delete(
      `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}/${firstMockRequestNeedBody.id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Family member Needs deleted successfully"
    );

    const deletedFamily = await MemberNeeds.findByPk(
      `${firstMockRequestNeedBody.id}`
    );
    expect(deletedFamily).toBeNull();
  });

  it("should return a 404 status code when an invalid family ID, member ID or need ID are provided", async () => {
    await Family.destroy({ where: {} });
    const firstResponse = await request.delete(
      `/api/member-needs/12345/${mockRequestFamilyBody.members[0].id}/${firstMockRequestNeedBody.id}`
    );

    expect(firstResponse.status).toBe(404);
    expect(firstResponse.body.message).toBe("Family member Needs not found");

    await FamilyMember.destroy({ where: {} });
    await request.post("/api/family").send(mockRequestFamilyBody);
    const secondResponse = await request.delete(
      `/api/member-needs/${mockRequestFamilyBody.id}/12345/${firstMockRequestNeedBody.id}`
    );

    expect(secondResponse.status).toBe(404);
    expect(secondResponse.body.message).toBe("Family member Needs not found");

    await MemberNeeds.destroy({ where: {} });
    const thirdResponse = await request.delete(
      `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}/12345`
    );
    expect(thirdResponse.status).toBe(404);
    expect(thirdResponse.body.message).toBe("Family member Needs not found");
  });
  // TODO: FIX IT
  // it("should return a 500 status code and an error message when an error occurs in the handler", async () => {
  //     const mockReq = {
  //         params: { familyId: "123", familyMemberId: "123", memberNeedId: "123" },
  //     } as unknown as Partial<Request>;
  //     const mockRes = {
  //         status: jest.fn().mockReturnThis(),
  //         json: jest.fn(),
  //     } as unknown as Response;

  //     jest.spyOn(MemberNeeds, "destroy").mockRejectedValue(new Error("Test error"));

  //     await httpDeleteMemberNeedsHandler(mockReq as Request, mockRes);

  //     expect(mockRes.status).toHaveBeenCalledWith(500);
  //     expect(mockRes.json).toHaveBeenCalledWith({
  //         message: "Internal server error",
  //     });
  // });
});

describe("httpGetAllMembersNeedsHandler", () => {
  it("should return all Member Needs when a valid family ID is provided", async () => {
    await request.post("/api/family").send(mockRequestFamilyBody);
    await request
      .post(`/api/family-member/${mockRequestFamilyBody.id}`)
      .send(mockRequestFamilyBody);

    const requests = [
      await request
        .post(
          `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
        )
        .send(firstMockRequestNeedBody),
      await request
        .post(
          `/api/member-needs/${mockRequestFamilyBody.id}/${mockRequestFamilyBody.members[0].id}`
        )
        .send(secondMockRequestNeedBody),
    ];
    await Promise.all(requests);

    const response = await request.get(
      `/api/member-needs/${mockRequestFamilyBody.id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.count).toBeDefined();
    expect(response.body.familyMembersNeeds).toBeDefined();
    expect(Array.isArray(response.body.familyMembersNeeds)).toBe(true);
  });

  it("should return 500 and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await httpGetAllMembersNeedsHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to retrieve family members Needs",
    });
  });

  it("should return 404 and an error message if the provided family ID is invalid", async () => {
    await Family.destroy({ where: {} });
    const res = await request.get(
      `/api/member-needs/${mockRequestFamilyBody.id}`
    );

    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Failed to retrieve family");
    expect(res.body.familyMemberNeeds).toBeUndefined();
  });
});
