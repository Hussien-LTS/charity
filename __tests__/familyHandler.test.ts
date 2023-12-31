import { Request, Response } from "express";
import supertest from "supertest";
import { app } from "../src/app";
import sequelize from "../src/models/sequelize";
import Family from "../src/models/Family";
import {
  httpAddFamilyHandler,
  httpDeleteFamilyHandler,
  httpEditFamilyHandler,
  httpGetAllFamiliesHandler,
  httpGetFamilyHandler,
} from "../src/controllers/family.controller";
import FamilyMember from "../src/models/FamilyMember";

const request = supertest(app);

const mockRequestBodyWithMembers = {
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

const mockRequestBodyWithoutMembers = {
  id: 1,
  houseCondition: "string",
  notes: "string",
  familyCategory: "Orphans",
  members: [],
};

const updatedMockRequestBody = {
  houseCondition: "updated house Condition",
};

beforeAll(async () => {
  await sequelize.sync();
  await Family.destroy({ where: {} });
  await FamilyMember.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe("httpAddFamilyHandler", () => {
  it("should add a new family With Members and return a success response", async () => {
    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
    const response = await request
      .post("/api/family")
      .send(mockRequestBodyWithMembers);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "Family and Family Members added successfully"
    );
    expect(response.body.family).toBeDefined();
    expect(Array.isArray(response.body.family.FamilyMember)).toBe(true);
    expect(response.body.family.FamilyMember.length).toBe(
      mockRequestBodyWithMembers.members.length
    );
    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
  });

  it("it should return 400 and an error message when no members are added", async () => {
    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
    const response = await request
      .post("/api/family")
      .send(mockRequestBodyWithoutMembers);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Should have at least one family member"
    );
    expect(response.body.family).toBeUndefined();

    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
  });

  it("it should return 500 and an error message when an error occurs in adding family info handler", async () => {
    const mockReq = {
      body: {
        id: 1,
        members: [{ id: 1 }],
      },
    } as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await httpAddFamilyHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to add family with members",
    });
  });
});

describe("httpGetFamilyHandler", () => {
  it("should return a family when a valid family ID is provided", async () => {
    await Family.destroy({ where: {} });
    await FamilyMember.destroy({ where: {} });
    await request.post("/api/family").send(mockRequestBodyWithMembers);

    const testFamilyId = mockRequestBodyWithMembers.id;
    const response = await request.get(`/api/family/${testFamilyId}`);

    expect(response.status).toBe(200);
    expect(response.body.family).toBeDefined();
  });

  it("should return 404 when an invalid family ID is provided", async () => {
    const response = await request.get("/api/family/22");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Family not found");
  });

  it("should return 500 and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await httpGetFamilyHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to retrieve family",
    });
  });
});

describe("httpEditFamilyHandler", () => {
  it("should update the family and return a success response", async () => {
    await request.post("/api/family").send(mockRequestBodyWithMembers);

    const response = await request
      .put(`/api/family/${mockRequestBodyWithMembers.id}`)
      .send(updatedMockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Family updated successfully");

    const updatedFamily = await Family.findByPk(53);
    if (updatedFamily) {
      expect(response.body.family).toBeDefined();
      expect(updatedFamily.id).toBe(mockRequestBodyWithMembers.id);
      expect(updatedFamily.houseCondition).toBe(
        mockRequestBodyWithMembers.houseCondition
      );
    }
  });

  it("should return a 200 status code when the family to update is not found", async () => {
    const response = await request
      .put("/api/family/22")
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

    jest.spyOn(Family, "update").mockRejectedValue(new Error("Test error"));

    await httpEditFamilyHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to edit family",
    });
  });
});

describe("httpDeleteFamilyHandler", () => {
  it("should delete the family and return a success response", async () => {
    await request.post("/api/family").send(mockRequestBodyWithMembers);
    const response = await request.delete(
      `/api/family/${mockRequestBodyWithMembers.id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Family deleted successfully");

    const deletedFamily = await Family.findByPk(mockRequestBodyWithMembers.id);
    expect(deletedFamily).toBeNull();
    expect(response.body.message).toBe("Family deleted successfully");
  });

  it("should return a 404 status code when the family to delete is not found", async () => {
    const response = await request.delete("/api/family/62326");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Family not found");
  });

  it("should return a 500 status code and an error message when an error occurs in the handler", async () => {
    const mockReq = {
      params: { familyId: "123" },
    } as unknown as Partial<Request>;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(Family, "destroy").mockRejectedValue(new Error("Test error"));

    await httpDeleteFamilyHandler(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

describe("httpGetAllFamiliesHandler", () => {
  it("should return an empty response if there are no Families", async () => {
    const response = await request.get(`/api/family`);
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(0);
    expect(Array.isArray(response.body.families)).toBe(true);
    expect(response.body.families).toEqual([]);
    expect(response.body.message).toBe("There are no families");
  });

  it("should return all Families when a valid request is provided", async () => {
    await request.post("/api/family").send(mockRequestBodyWithMembers);

    const response = await request.get(`/api/family`);

    expect(response.status).toBe(200);
    expect(response.body.count).toBeDefined();
    expect(response.body.families).toBeDefined();
    expect(Array.isArray(response.body.families)).toBe(true);

    const allFamilies = await Family.findAll();
    expect(response.body.count).toBe(allFamilies.length);
  });

  it("should return 500 and an error message when an error occurs in the handler", async () => {
    const mockReq = {} as unknown as Partial<Request>;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(Family, "findAll").mockRejectedValue(new Error("Test error"));

    await httpGetAllFamiliesHandler(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to retrieve families",
    });
  });
});
