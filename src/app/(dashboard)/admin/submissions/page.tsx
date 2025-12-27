"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPhoneNumber } from "@/lib/event-utils";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const statusLabels = {
  PENDING: "신청",
  PROCESSING: "작업중",
  CONTACTED: "연락완료",
  COMPLETED: "상담완료",
};

type SortField = 'createdAt' | 'name' | 'birthDate' | 'phone' | 'subjectType' | 'audioFiles' | 'status';
type SortDirection = 'asc' | 'desc';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const itemsPerPage = 15;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter submissions by search query and status
  const filteredSubmissions = submissions.filter((submission) => {
    // Status filter
    if (statusFilter !== 'ALL' && submission.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const name = submission.name?.toLowerCase() || '';
    const phone = submission.phone || '';

    return name.includes(query) || phone.includes(query);
  });

  // Sort filtered submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'createdAt':
      case 'birthDate':
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
        break;
      case 'audioFiles':
        aValue = Array.isArray(a.audioFiles) ? a.audioFiles.length : 0;
        bValue = Array.isArray(b.audioFiles) ? b.audioFiles.length : 0;
        break;
      case 'subjectType':
        aValue = a.subjectType === '기타' ? a.subjectOther : a.subjectType;
        bValue = b.subjectType === '기타' ? b.subjectOther : b.subjectType;
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Calculate stats
  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    contacted: submissions.filter((s) => s.status === "CONTACTED").length,
    processing: submissions.filter((s) => s.status === "PROCESSING").length,
    completed: submissions.filter((s) => s.status === "COMPLETED").length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">제1장 무료 이벤트 신청자 관리</h1>
        <p className="text-muted-foreground">
          자서전 제1장 무료 제작 이벤트 신청자 목록
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ALL' ? 'ring-2 ring-primary shadow-md' : ''
          }`}
          onClick={() => setStatusFilter('ALL')}
        >
          <CardHeader className="pb-1 pt-4 text-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-2 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PENDING' ? 'ring-2 ring-yellow-500 shadow-md' : ''
          }`}
          onClick={() => setStatusFilter('PENDING')}
        >
          <CardHeader className="pb-1 pt-4 text-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              신청
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-2 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PROCESSING' ? 'ring-2 ring-purple-500 shadow-md' : ''
          }`}
          onClick={() => setStatusFilter('PROCESSING')}
        >
          <CardHeader className="pb-1 pt-4 text-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              작업중
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-2 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.processing}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'CONTACTED' ? 'ring-2 ring-blue-500 shadow-md' : ''
          }`}
          onClick={() => setStatusFilter('CONTACTED')}
        >
          <CardHeader className="pb-1 pt-4 text-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              연락완료
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-2 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.contacted}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'COMPLETED' ? 'ring-2 ring-green-500 shadow-md' : ''
          }`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <CardHeader className="pb-1 pt-4 text-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              상담완료
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-2 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="이름 또는 전화번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-right">
              {filteredSubmissions.length}개의 결과를 찾았습니다.
            </p>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('createdAt')}
                  >
                    제출일
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'createdAt' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('name')}
                  >
                    이름
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'name' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('birthDate')}
                  >
                    생년월일
                    {sortField === 'birthDate' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'birthDate' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('phone')}
                  >
                    전화번호
                    {sortField === 'phone' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'phone' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('subjectType')}
                  >
                    자서전 주인공
                    {sortField === 'subjectType' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'subjectType' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('audioFiles')}
                  >
                    음성 파일
                    {sortField === 'audioFiles' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'audioFiles' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('status')}
                  >
                    상태
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'status' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission) => {
                  const audioFiles = Array.isArray(submission.audioFiles)
                    ? submission.audioFiles
                    : [];

                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div>{new Date(submission.createdAt).toLocaleDateString("ko-KR")}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleTimeString("ko-KR", {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.birthDate).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>{formatPhoneNumber(submission.phone)}</TableCell>
                      <TableCell>
                        {submission.subjectType === "기타"
                          ? `기타 (${submission.subjectOther})`
                          : submission.subjectType}
                      </TableCell>
                      <TableCell>{audioFiles.length}개</TableCell>
                      <TableCell>
                        <Badge className={statusColors[submission.status]}>
                          {statusLabels[submission.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/submissions/${submission.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-1 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
