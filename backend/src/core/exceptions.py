from fastapi import HTTPException, status


def not_found_exception(detail: str = "Resource not found"):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def unauthorized_exception(detail: str = "Unauthorized"):
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def forbidden_exception(detail: str = "Forbidden"):
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def bad_request_exception(detail: str = "Bad request"):
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def conflict_exception(detail: str = "Conflict"):
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
