import { Spinner } from "@heroui/react";
import DataTable, { TableColumn, IDataTableProps } from "react-data-table-component";

interface DataTableCustomProps<T> extends IDataTableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
}

export function LoadingComponent() {
    return <div className="flex justify-center my-5">
        <Spinner />
    </div>
}

export default function DataTableCustom<T>({ columns, data, ...props }: DataTableCustomProps<T>) {
    return (
        <div className="rounded-t-md">
            <DataTable
                columns={columns}
                data={data}
                {...props}
                theme="dark"
                customStyles={{
                    tableWrapper: {
                        style: {
                            backgroundColor: "#18181b",
                        },
                    },
                    headCells: {
                        style: {
                            fontWeight: "bolder",
                            fontSize: "14px",
                            backgroundColor: "#3f3f46",
                            color: "white",
                        },
                    },
                    rows: {
                        style: {
                            backgroundColor: "#18181b",
                            color: "white",
                        },
                    },
                    pagination: {
                        style: {
                            backgroundColor: "#18181b",
                            color: "white",
                            borderTop: "1px solid #2d2d2f",
                            borderBottomLeftRadius: "0.375rem",
                            borderBottomRightRadius: "0.375rem"
                        },
                    },
                }}
                className="rounded-md"
                noDataComponent={<h3 className="font-bold text-lg p-6 text-white">Data Kosong</h3>}
                progressComponent={<LoadingComponent />}
            />
        </div>
    );
}
