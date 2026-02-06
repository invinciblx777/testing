export default function DashboardLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-500" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Loading dashboard...</h3>
            </div>
        </div>
    );
}
