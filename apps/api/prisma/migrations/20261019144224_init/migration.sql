-- CreateEnum
CREATE TYPE "RoundFormat" AS ENUM ('STROKE_PLAY', 'STABLEFORD', 'MATCH_PLAY');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'JOINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "auth0Subject" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "country" CHAR(2),
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "showHandicapToCrews" BOOLEAN NOT NULL DEFAULT true,
    "notifyInvitations" BOOLEAN NOT NULL DEFAULT true,
    "notifyScores" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GolfProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handicapIndex" DECIMAL(3,1),
    "preferredFormat" "RoundFormat",
    "experienceLevel" "ExperienceLevel",
    "homeCourseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GolfProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crew" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrewMember" (
    "id" TEXT NOT NULL,
    "crewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CrewRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrewMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedEmail" TEXT,
    "createdById" TEXT NOT NULL,
    "crewId" TEXT,
    "roundId" TEXT,
    "tournamentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GolfCourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" CHAR(2) NOT NULL,
    "city" TEXT,
    "location" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GolfCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTee" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genderCategory" TEXT,
    "courseRating" DECIMAL(4,1) NOT NULL,
    "slopeRating" INTEGER NOT NULL,

    CONSTRAINT "CourseTee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GolfHole" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "strokeIndex" INTEGER NOT NULL,

    CONSTRAINT "GolfHole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teeId" TEXT,
    "crewId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "holesCount" INTEGER NOT NULL,
    "format" "RoundFormat" NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundParticipant" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'JOINED',
    "playingHandicap" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoleScore" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "strokes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoleScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizerId" TEXT NOT NULL,
    "crewId" TEXT,
    "roundId" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Subject_key" ON "User"("auth0Subject");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "GolfProfile_userId_key" ON "GolfProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Crew_slug_key" ON "Crew"("slug");

-- CreateIndex
CREATE INDEX "Crew_ownerId_idx" ON "Crew"("ownerId");

-- CreateIndex
CREATE INDEX "CrewMember_userId_idx" ON "CrewMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewMember_crewId_userId_key" ON "CrewMember"("crewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_crewId_idx" ON "Invitation"("crewId");

-- CreateIndex
CREATE INDEX "Invitation_roundId_idx" ON "Invitation"("roundId");

-- CreateIndex
CREATE INDEX "Invitation_tournamentId_idx" ON "Invitation"("tournamentId");

-- CreateIndex
CREATE INDEX "GolfCourse_name_idx" ON "GolfCourse"("name");

-- CreateIndex
CREATE INDEX "CourseTee_courseId_idx" ON "CourseTee"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "GolfHole_courseId_holeNumber_key" ON "GolfHole"("courseId", "holeNumber");

-- CreateIndex
CREATE INDEX "Round_creatorId_idx" ON "Round"("creatorId");

-- CreateIndex
CREATE INDEX "Round_crewId_idx" ON "Round"("crewId");

-- CreateIndex
CREATE INDEX "Round_scheduledAt_idx" ON "Round"("scheduledAt");

-- CreateIndex
CREATE INDEX "RoundParticipant_userId_idx" ON "RoundParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundParticipant_roundId_userId_key" ON "RoundParticipant"("roundId", "userId");

-- CreateIndex
CREATE INDEX "HoleScore_roundId_idx" ON "HoleScore"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "HoleScore_participantId_holeNumber_key" ON "HoleScore"("participantId", "holeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_roundId_key" ON "Tournament"("roundId");

-- CreateIndex
CREATE INDEX "Tournament_organizerId_idx" ON "Tournament"("organizerId");

-- CreateIndex
CREATE INDEX "Tournament_crewId_idx" ON "Tournament"("crewId");

-- AddForeignKey
ALTER TABLE "GolfProfile" ADD CONSTRAINT "GolfProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfProfile" ADD CONSTRAINT "GolfProfile_homeCourseId_fkey" FOREIGN KEY ("homeCourseId") REFERENCES "GolfCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewMember" ADD CONSTRAINT "CrewMember_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrewMember" ADD CONSTRAINT "CrewMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfCourse" ADD CONSTRAINT "GolfCourse_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTee" ADD CONSTRAINT "CourseTee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GolfCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfHole" ADD CONSTRAINT "GolfHole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GolfCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GolfCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "CourseTee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundParticipant" ADD CONSTRAINT "RoundParticipant_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundParticipant" ADD CONSTRAINT "RoundParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "RoundParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Invitations target exactly one resource
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_single_target" CHECK (num_nonnulls("crewId", "roundId", "tournamentId") = 1);
-- Scores and handicap sanity
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_strokes_range" CHECK ("strokes" IS NULL OR "strokes" BETWEEN 1 AND 20);
ALTER TABLE "GolfProfile" ADD CONSTRAINT "GolfProfile_handicap_range" CHECK ("handicapIndex" IS NULL OR "handicapIndex" BETWEEN -10 AND 54);
ALTER TABLE "Round" ADD CONSTRAINT "Round_holes_count" CHECK ("holesCount" IN (9, 18));
